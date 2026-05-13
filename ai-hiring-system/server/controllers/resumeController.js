// server/controllers/resumeController.js
const axios = require('axios');
const FormData = require('form-data');
const User = require('../models/User');
const logger = require('../utils/logger');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';
const AI_PARSE_ENDPOINT = process.env.AI_PARSE_ENDPOINT || '/parse-resume';
const AI_RESUME_VECTOR_ENDPOINT = process.env.AI_RESUME_VECTOR_ENDPOINT || '/vector/resumes/upsert';
const AI_TIMEOUT_MS = Number(process.env.AI_TIMEOUT_MS || 20000);
const AI_MAX_RETRIES = Number(process.env.AI_MAX_RETRIES || 2);

const getAiParseUrl = () => new URL(AI_PARSE_ENDPOINT, AI_SERVICE_URL).toString();
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isRetryableAiError = (error) => {
    if (!error) return false;
    const retryableCodes = new Set(['ECONNREFUSED', 'ECONNRESET', 'ETIMEDOUT', 'EAI_AGAIN']);
    if (retryableCodes.has(error.code)) return true;
    const status = error.response?.status;
    return status >= 500 && status <= 599;
};

const postToAiWithRetry = async (formData, headers, requestId) => {
    const url = getAiParseUrl();
    let attempt = 0;
    while (true) {
        try {
            return await axios.post(url, formData, {
                headers,
                timeout: AI_TIMEOUT_MS,
                maxBodyLength: Infinity,
                maxContentLength: Infinity
            });
        } catch (error) {
            if (!isRetryableAiError(error) || attempt >= AI_MAX_RETRIES) {
                logger.error({
                    message: 'AI parse request failed after all retries',
                    error: { message: error.message, code: error.code, status: error.response?.status },
                    attempt,
                    url,
                    requestId
                });
                throw error;
            }
            const delayMs = 500 * Math.pow(2, attempt);
            logger.warn({
                message: `AI parse retry ${attempt + 1}/${AI_MAX_RETRIES}`,
                delayMs,
                error: { code: error.code, status: error.response?.status },
                requestId
            });
            await sleep(delayMs);
            attempt += 1;
        }
    }
};

const upsertResumeVector = async (candidateId, extracted, profile, requestId) => {
    try {
        const payload = {
            candidate_id: String(candidateId),
            skills: Array.isArray(extracted.skills) ? extracted.skills : [],
            education: Array.isArray(extracted.education)
                ? extracted.education.join(' | ')
                : (typeof extracted.education === 'string' ? extracted.education : ''),
            experience: typeof extracted.experience === 'string' ? extracted.experience : '',
            total_experience_years: Number.isFinite(Number(extracted.total_experience_years))
                ? Number(extracted.total_experience_years)
                : (Number.isFinite(Number(extracted.experience_years)) ? Number(extracted.experience_years) : 0),
            job_titles: Array.isArray(extracted.job_titles) ? extracted.job_titles : [],
            companies: Array.isArray(extracted.companies) ? extracted.companies : [],
            certifications: Array.isArray(extracted.certifications) ? extracted.certifications : [],
            languages: Array.isArray(extracted.languages) ? extracted.languages : [],
            address: typeof extracted.address === 'string' ? extracted.address : '',
            preferences: profile?.preferences || {}
        };

        await axios.post(new URL(AI_RESUME_VECTOR_ENDPOINT, AI_SERVICE_URL).toString(), payload, {
            timeout: AI_TIMEOUT_MS
        });
        logger.info({ message: 'AI resume vector upsert successful', candidateId, requestId });
    } catch (error) {
        logger.warn({
            message: 'AI resume vector upsert failed',
            candidateId,
            error: { message: error.message, code: error.code },
            requestId
        });
    }
};

// @desc    Upload resume, send to Python AI for parsing, and save to profile
// @route   POST /api/resume/upload
// @access  Private (Only logged-in Job Seekers)
const uploadAndParseResume = async (req, res) => {
    const requestId = req.id;
    try {
        // 1. Check if file exists
        if (!req.file) {
            logger.warn({ message: 'Resume upload failed: No file provided', userId: req.user._id, requestId });
            return res.status(400).json({ message: 'Please upload a file' });
        }

        // 2. Prepare the file to be sent to Python
        const formData = new FormData();
        formData.append('file', req.file.buffer, {
            filename: req.file.originalname,
            contentType: req.file.mimetype || 'application/pdf'
        });

        // 3. Make the request to the Python FastAPI microservice
        logger.info({ message: 'Sending resume to AI for parsing', userId: req.user._id, filename: req.file.originalname, requestId });
        const pythonResponse = await postToAiWithRetry(formData, {
            ...formData.getHeaders(),
        }, requestId);

        const parsedData = pythonResponse.data || {};
        const extracted = parsedData.extracted_data || parsedData.user_profile || {};

        // Support both legacy and current AI contracts.
        const parsedSkills = Array.isArray(extracted.skills) ? extracted.skills : [];
        const parsedEducation = Array.isArray(extracted.education)
            ? extracted.education.join(' | ')
            : (typeof extracted.education === 'string' ? extracted.education : '');
        const extractedYears = Number.isFinite(Number(extracted.total_experience_years))
            ? Number(extracted.total_experience_years)
            : (Number.isFinite(Number(extracted.experience_years)) ? Number(extracted.experience_years) : null);
        const parsedExperience = typeof extracted.experience === 'string'
            ? extracted.experience
            : (extractedYears !== null ? `${extractedYears} years` : '');

        // 4. Save the parsed data to the User's database profile
        // (req.user._id comes from the 'protect' auth middleware)
        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            {
                $set: {
                    'profile.resume_url': req.file.originalname, // In a real app, upload to AWS S3 here
                    'profile.name': extracted.name || updatedUser.profile.name,
                    'profile.email': extracted.email || updatedUser.profile.email,
                    'profile.phone': extracted.phone || updatedUser.profile.phone,
                    'profile.location': extracted.address || updatedUser.profile.location,
                    'profile.skills': parsedSkills,
                    'profile.education': parsedEducation,
                    'profile.experience': parsedExperience,
                    'profile.experience_years': extractedYears,
                    'profile.links': extracted.links || [],
                    'profile.certifications': extracted.certifications || [],
                    'profile.languages': extracted.languages || [],
                }
            },
            { new: true } // Return the updated document
        ).select('-password'); // Don't return the password

        await upsertResumeVector(req.user._id, extracted, updatedUser.profile, requestId);

        // 5. Send success response back to the React frontend
        logger.info({ message: 'Resume parsed and profile updated successfully', userId: req.user._id, requestId });
        res.status(200).json({
            message: 'Resume parsed and profile updated successfully',
            ai_data: parsedData,
            user_profile: updatedUser.profile
        });

    } catch (error) {
        logger.error({
            message: 'AI Engine Communication Error during resume parsing',
            error: {
                message: error.message,
                code: error.code,
                status: error.response?.status,
                data: error.response?.data,
                stack: error.stack
            },
            userId: req.user?._id,
            requestId
        });

        if (error.response) {
            // Forward the AI service's error if available
            return res.status(error.response.status || 502).json({
                message: 'Error from AI service',
                error: error.response.data
            });
        }

        res.status(502).json({
            message: 'Failed to communicate with AI service',
            error: {
                message: error.message,
                code: error.code
            }
        });
    }
};

module.exports = {
    uploadAndParseResume
};
