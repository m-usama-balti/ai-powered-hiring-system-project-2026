// server/controllers/jobController.js
const Job = require('../models/Job');
const User = require('../models/User');
const Application = require('../models/Application');
const axios = require('axios');
const logger = require('../utils/logger');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';
const AI_VECTOR_JOB_ENDPOINT = process.env.AI_VECTOR_JOB_ENDPOINT || '/vector/jobs/upsert';
const AI_VECTOR_JOB_DELETE_ENDPOINT = process.env.AI_VECTOR_JOB_DELETE_ENDPOINT || '/vector/jobs';
const AI_RECOMMEND_ENDPOINT = process.env.AI_RECOMMEND_ENDPOINT || '/recommendations/jobs';
const AI_TIMEOUT_MS = Number(process.env.AI_TIMEOUT_MS || 20000);

const getAiUrl = (path) => new URL(path, AI_SERVICE_URL).toString();

const normalizeSkills = (skills = []) =>
    skills.map((s) => String(s).trim().toLowerCase()).filter(Boolean);

const extractYears = (value) => {
    if (!value) return 0;
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    const match = String(value).match(/\d+/);
    return match ? Number.parseInt(match[0], 10) : 0;
};

const calculateProfileCompletion = (profile = {}) => {
    let score = 0;
    if (profile.name) score += 20;
    if (profile.education) score += 20;
    if (profile.experience) score += 20;
    if (Array.isArray(profile.skills) && profile.skills.length > 0) score += 25;
    if (profile.resume_url) score += 15;
    return Math.min(score, 100);
};

const computeMatchBreakdown = (user, job) => {
    const candidateSkills = normalizeSkills(user?.profile?.skills || []);
    const requiredSkills = normalizeSkills(job?.requirements?.skills || []);

    const skillHits = requiredSkills.filter((skill) => candidateSkills.includes(skill));
    const skillSimilarity = requiredSkills.length === 0 ? 100 : (skillHits.length / requiredSkills.length) * 100;

    const candidateExp = extractYears(user?.profile?.experience);
    const requiredExp = Number(job?.requirements?.experience_years || 0);
    const experienceMatch = requiredExp === 0 ? 100 : Math.min((candidateExp / requiredExp) * 100, 100);

    const educationLevel = String(job?.requirements?.education_level || '').toLowerCase();
    const educationText = String(user?.profile?.education || '').toLowerCase();
    const educationMatch = !educationLevel ? 100 : (educationText.includes(educationLevel) ? 100 : 40);

    const preferredLocation = String(user?.profile?.preferences?.desired_location || '').toLowerCase();
    const jobLocation = String(job?.location || '').toLowerCase();
    const preferenceMatch = !preferredLocation ? 60 : (jobLocation.includes(preferredLocation) ? 100 : 25);

    const finalScore =
        (skillSimilarity * 0.4) +
        (experienceMatch * 0.3) +
        (educationMatch * 0.2) +
        (preferenceMatch * 0.1);

    const completion = calculateProfileCompletion(user?.profile || {});
    const hiringProbability = Math.min((finalScore * 0.85) + (completion * 0.15), 100);

    return {
        match_score: Math.round(finalScore),
        hiring_probability: Math.round(hiringProbability),
        reasons: {
            skill_match: Math.round(skillSimilarity),
            experience_match: Math.round(experienceMatch),
            education_match: Math.round(educationMatch),
            preference_match: Math.round(preferenceMatch)
        },
        missing_skills: requiredSkills.filter((skill) => !candidateSkills.includes(skill)).slice(0, 6)
    };
};

const buildJobVectorPayload = (job) => ({
    job_id: String(job._id),
    job_title: job.job_title,
    description: job.description,
    skills: job.requirements?.skills || [],
    location: job.location || '',
    education_level: job.requirements?.education_level || '',
    experience_years: job.requirements?.experience_years || 0
});

const upsertJobVector = async (job, requestId) => {
    try {
        await axios.post(getAiUrl(AI_VECTOR_JOB_ENDPOINT), buildJobVectorPayload(job), { timeout: AI_TIMEOUT_MS });
        logger.info({ message: 'AI vector upsert successful', jobId: job._id, requestId });
    } catch (error) {
        logger.warn({
            message: 'AI vector upsert failed',
            jobId: job._id,
            error: { message: error.message, code: error.code },
            requestId
        });
    }
};

const removeJobVector = async (jobId, requestId) => {
    try {
        await axios.delete(getAiUrl(`${AI_VECTOR_JOB_DELETE_ENDPOINT}/${jobId}`), { timeout: AI_TIMEOUT_MS });
        logger.info({ message: 'AI vector delete successful', jobId, requestId });
    } catch (error) {
        logger.warn({
            message: 'AI vector delete failed',
            jobId,
            error: { message: error.message, code: error.code },
            requestId
        });
    }
};

// @desc    Create a new job (Defaults to pending for Admin approval)
// @route   POST /api/jobs
// @access  Private (Recruiter only)
const createJob = async (req, res) => {
    const requestId = req.id;
    try {
        // 1. Verify the user is actually a recruiter
        if (req.user.user_type !== 'recruiter') {
            logger.warn({ message: 'Access denied for job creation', userId: req.user._id, userType: req.user.user_type, requestId });
            return res.status(403).json({ message: 'Access denied. Only recruiters can post jobs.' });
        }

        const body = req.body || {};
        const { job_title, description, requirements, location, salary_range } = body;

        // 2. Basic Validation
        if (!job_title || !description || !requirements) {
            logger.warn({ message: 'Job creation failed due to missing fields', body, userId: req.user._id, requestId });
            return res.status(400).json({ message: 'Missing required fields: job_title, description, and requirements are mandatory.' });
        }

        // 3. Create the job and explicitly tie it to the recruiter and set status
        const job = await Job.create({
            recruiter_id: req.user._id, // Crucial: Ties the job to the logged-in recruiter
            job_title,
            description,
            requirements,
            location: location || 'Remote',
            salary_range,
            status: 'pending' // Crucial: Forces it into the Admin's approval queue
        });

        await upsertJobVector(job, requestId);

        logger.info({ message: 'Job created successfully', jobId: job._id, recruiterId: req.user._id, requestId });
        res.status(201).json(job);
    } catch (error) {
        logger.error({
            message: 'Failed to create job',
            error: { message: error.message, stack: error.stack },
            userId: req.user._id,
            requestId
        });
        res.status(500).json({ message: 'Failed to create job', error: error.message });
    }
};

// @desc    Get jobs posted by the authenticated recruiter
// @route   GET /api/jobs/me
// @access  Private (Recruiter)
const getMyJobs = async (req, res) => {
    const requestId = req.id;
    try {
        if (req.user.user_type !== 'recruiter') {
            logger.warn({ message: 'Access denied for job retrieval', userId: req.user._id, userType: req.user.user_type, requestId });
            return res.status(403).json({ message: 'Access denied. Only recruiters can view their jobs.' });
        }

        const jobs = await Job.find({ recruiter_id: req.user._id }).populate('recruiter_id', 'company.company_name email');
        logger.info({ message: 'Fetched recruiter jobs', count: jobs.length, recruiterId: req.user._id, requestId });
        res.status(200).json(jobs);
    } catch (error) {
        logger.error({
            message: 'Failed to fetch recruiter jobs',
            error: { message: error.message, stack: error.stack },
            userId: req.user._id,
            requestId
        });
        res.status(500).json({ message: 'Failed to fetch jobs', error: error.message });
    }
};

// @desc    Get all active jobs
// @route   GET /api/jobs
// @access  Public or Private (Seekers)
const getJobs = async (req, res) => {
    const requestId = req.id;
    try {
        const jobs = await Job.find({ status: 'active' }).populate('recruiter_id', 'company.company_name email');
        logger.info({ message: 'Fetched all active jobs', count: jobs.length, requestId });
        res.status(200).json(jobs);
    } catch (error) {
        logger.error({
            message: 'Failed to fetch jobs',
            error: { message: error.message, stack: error.stack },
            requestId
        });
        res.status(500).json({ message: 'Failed to fetch jobs', error: error.message });
    }
};

// @desc    Get a single job by ID
// @route   GET /api/jobs/:id
// @access  Public or Private
const getJobById = async (req, res) => {
    const requestId = req.id;
    try {
        const job = await Job.findById(req.params.id).populate('recruiter_id', 'company.company_name email');
        if (!job) {
            logger.warn({ message: 'Job not found', jobId: req.params.id, requestId });
            return res.status(404).json({ message: 'Job not found' });
        }
        res.status(200).json(job);
    } catch (error) {
        logger.error({
            message: 'Failed to fetch job by ID',
            jobId: req.params.id,
            error: { message: error.message, stack: error.stack },
            requestId
        });
        res.status(500).json({ message: 'Failed to fetch job', error: error.message });
    }
};

// @desc    Update a job
// @route   PUT /api/jobs/:id
// @access  Private (Recruiter or Admin)
const updateJob = async (req, res) => {
    const requestId = req.id;
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            logger.warn({ message: 'Job not found for update', jobId: req.params.id, userId: req.user._id, requestId });
            return res.status(404).json({ message: 'Job not found' });
        }

        // Check if the user is the original recruiter or an admin
        if (job.recruiter_id.toString() !== req.user._id.toString() && req.user.user_type !== 'admin') {
            logger.warn({ message: 'Unauthorized attempt to update job', jobId: req.params.id, userId: req.user._id, requestId });
            return res.status(401).json({ message: 'User not authorized to update this job' });
        }

        const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

        // If relevant fields changed, update the vector
        await upsertJobVector(updatedJob, requestId);

        logger.info({ message: 'Job updated successfully', jobId: updatedJob._id, userId: req.user._id, requestId });
        res.status(200).json(updatedJob);
    } catch (error) {
        logger.error({
            message: 'Failed to update job',
            jobId: req.params.id,
            error: { message: error.message, stack: error.stack },
            userId: req.user._id,
            requestId
        });
        res.status(500).json({ message: 'Failed to update job', error: error.message });
    }
};

// @desc    Delete a job
// @route   DELETE /api/jobs/:id
// @access  Private (Recruiter or Admin)
const deleteJob = async (req, res) => {
    const requestId = req.id;
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            logger.warn({ message: 'Job not found for deletion', jobId: req.params.id, userId: req.user._id, requestId });
            return res.status(404).json({ message: 'Job not found' });
        }

        // Check if the user is the original recruiter or an admin
        if (job.recruiter_id.toString() !== req.user._id.toString() && req.user.user_type !== 'admin') {
            logger.warn({ message: 'Unauthorized attempt to delete job', jobId: req.params.id, userId: req.user._id, requestId });
            return res.status(401).json({ message: 'User not authorized to delete this job' });
        }

        await job.deleteOne(); // Use deleteOne instead of remove
        await removeJobVector(req.params.id, requestId);
        // Also delete associated applications
        await Application.deleteMany({ job_id: req.params.id });

        logger.info({ message: 'Job deleted successfully', jobId: req.params.id, userId: req.user._id, requestId });
        res.status(200).json({ message: 'Job removed' });
    } catch (error) {
        logger.error({
            message: 'Failed to delete job',
            jobId: req.params.id,
            error: { message: error.message, stack: error.stack },
            userId: req.user._id,
            requestId
        });
        res.status(500).json({ message: 'Failed to delete job', error: error.message });
    }
};

// @desc    Get job recommendations for a user
// @route   GET /api/jobs/recommendations
// @access  Private (Seeker)
const getRecommendedJobs = async (req, res) => {
    const requestId = req.id;
    try {
        const user = await User.findById(req.user._id);
        if (!user || user.user_type !== 'job_seeker') {
            logger.warn({ message: 'Recommendation request for non-seeker user', userId: req.user._id, requestId });
            return res.status(403).json({ message: 'Access denied.' });
        }

        // --- AI-Powered Vector Search ---
        try {
            const aiRequestPayload = {
                user_id: String(user._id),
                limit: 20
            };

            const response = await axios.post(getAiUrl(AI_RECOMMEND_ENDPOINT), aiRequestPayload, { timeout: AI_TIMEOUT_MS });

            if (response.data && response.data.recommendations) {
                logger.info({ message: 'Successfully fetched AI recommendations', userId: user._id, count: response.data.recommendations.length, requestId });
                return res.status(200).json(response.data.recommendations);
            }
        } catch (aiError) {
            logger.error({
                message: 'AI recommendation service failed, falling back to local scoring',
                error: { message: aiError.message, code: aiError.code },
                userId: user._id,
                requestId
            });
            // Fallback to local scoring if AI service fails
        }

        // --- Fallback Local Scoring ---
        logger.info({ message: 'Using fallback local scoring for recommendations', userId: user._id, requestId });
        const allJobs = await Job.find({ status: 'active' }).lean(); // Use .lean() for performance
        const scoredJobs = allJobs.map(job => {
            const breakdown = computeMatchBreakdown(user, job);
            return {
                ...job,
                ...breakdown
            };
        });

        const sortedJobs = scoredJobs.sort((a, b) => b.hiring_probability - a.hiring_probability);

        res.status(200).json(sortedJobs.slice(0, 20));

    } catch (error) {
        logger.error({
            message: 'Failed to get job recommendations',
            error: { message: error.message, stack: error.stack },
            userId: req.user._id,
            requestId
        });
        res.status(500).json({ message: 'Failed to get recommendations', error: error.message });
    }
};

// @desc    Recruiter analytics for dashboard overview and charts
// @route   GET /api/jobs/analytics
// @access  Private (Recruiter only)
const getJobAnalytics = async (req, res) => {
    const requestId = req.id;
    try {
        if (req.user.user_type !== 'recruiter') {
            logger.warn({ message: 'Analytics request for non-recruiter user', userId: req.user._id, requestId });
            return res.status(403).json({ message: 'Access denied.' });
        }

        const jobs = await Job.find({ recruiter_id: req.user._id }).select('_id status job_title');
        const jobIds = jobs.map((job) => job._id);
        const applications = await Application.find({ job_id: { $in: jobIds } }).select('status ai_match_score createdAt');

        const funnel = {
            total_applied: applications.length,
            applied: applications.filter((application) => application.status === 'applied').length,
            pending: applications.filter((application) => application.status === 'applied').length,
            shortlisted: applications.filter((application) => application.status === 'shortlisted').length,
            interviewing: applications.filter((application) => application.status === 'interviewing').length,
            hired: applications.filter((application) => application.status === 'hired').length,
            rejected: applications.filter((application) => application.status === 'rejected').length
        };

        const scoreDistribution = {
            excellent: applications.filter((application) => Number(application.ai_match_score || 0) >= 80).length,
            good: applications.filter((application) => {
                const score = Number(application.ai_match_score || 0);
                return score >= 60 && score < 80;
            }).length,
            average: applications.filter((application) => {
                const score = Number(application.ai_match_score || 0);
                return score >= 40 && score < 60;
            }).length,
            poor: applications.filter((application) => Number(application.ai_match_score || 0) < 40).length
        };

        const activeJobs = jobs.filter((job) => job.status === 'active').length;
        const pendingJobs = jobs.filter((job) => job.status === 'pending').length;

        res.status(200).json({
            active_jobs: activeJobs,
            pending_jobs: pendingJobs,
            funnel,
            scoreDistribution,
            recent_activity: applications.slice(0, 8).map((application) => ({
                status: application.status,
                ai_match_score: application.ai_match_score,
                createdAt: application.createdAt
            }))
        });
    } catch (error) {
        logger.error({
            message: 'Failed to fetch recruiter analytics',
            error: { message: error.message, stack: error.stack },
            userId: req.user._id,
            requestId
        });
        res.status(500).json({ message: 'Failed to fetch recruiter analytics', error: error.message });
    }
};


module.exports = {
    createJob,
    getJobs,
    getMyJobs,
    getJobById,
    updateJob,
    deleteJob,
    getRecommendedJobs,
    getJobAnalytics,
};
