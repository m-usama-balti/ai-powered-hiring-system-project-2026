// server/controllers/resumeController.js
const axios = require('axios');
const FormData = require('form-data');
const User = require('../models/User');

// @desc    Upload resume, send to Python AI for parsing, and save to profile
// @route   POST /api/resume/upload
// @access  Private (Only logged-in Job Seekers)
const uploadAndParseResume = async (req, res) => {
    try {
        // 1. Check if file exists
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a file' });
        }

        // 2. Prepare the file to be sent to Python
        const formData = new FormData();
        formData.append('file', req.file.buffer, {
            filename: req.file.originalname,
            contentType: req.file.mimetype || 'application/pdf'
        });

        // 3. Make the request to the Python FastAPI microservice
        console.log("Sending file to AI Engine for parsing...");
        const pythonResponse = await axios.post('http://127.0.0.1:8000/parse', formData, {
            headers: {
                ...formData.getHeaders(),
            },
        });

        const parsedData = pythonResponse.data || {};
        const extracted = parsedData.extracted_data || parsedData.user_profile || {};

        // Support both legacy and current AI contracts.
        const parsedSkills = Array.isArray(extracted.skills) ? extracted.skills : [];
        const parsedEducation = typeof extracted.education === 'string' ? extracted.education : '';
        const parsedExperience = typeof extracted.experience === 'string'
            ? extracted.experience
            : (Number.isFinite(Number(extracted.experience_years)) ? `${Number(extracted.experience_years)} years` : '');

        // 4. Save the parsed data to the User's database profile
        // (req.user._id comes from the 'protect' auth middleware)
        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            {
                $set: {
                    'profile.resume_url': req.file.originalname, // In a real app, upload to AWS S3 here
                    'profile.skills': parsedSkills,
                    'profile.education': parsedEducation,
                    'profile.experience': parsedExperience
                }
            },
            { new: true } // Return the updated document
        ).select('-password'); // Don't return the password

        // 5. Send success response back to the React frontend
        res.status(200).json({
            message: 'Resume parsed and profile updated successfully',
            ai_data: parsedData,
            user_profile: updatedUser.profile
        });

    } catch (error) {
        const aiStatus = error.response?.status;
        const aiDetail = error.response?.data?.detail || error.response?.data?.message;
        const statusCode = (aiStatus && aiStatus >= 400 && aiStatus < 600) ? aiStatus : 500;
        const errorMessage = aiDetail || error.message;

        console.error('AI Engine Communication Error:', errorMessage);

        if (statusCode === 400 || statusCode === 422) {
            return res.status(statusCode).json({ message: errorMessage });
        }

        return res.status(500).json({ message: 'Failed to process resume via AI', error: errorMessage });
    }
};

module.exports = { uploadAndParseResume };
