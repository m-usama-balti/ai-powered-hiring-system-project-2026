// server/controllers/jobController.js
const Job = require('../models/Job');
const User = require('../models/User');
const Application = require('../models/Application');

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

// @desc    Create a new job (Defaults to pending for Admin approval)
// @route   POST /api/jobs
// @access  Private (Recruiter only)
const createJob = async (req, res) => {
    try {
        // 1. Verify the user is actually a recruiter
        if (req.user.user_type !== 'recruiter') {
            return res.status(403).json({ message: 'Access denied. Only recruiters can post jobs.' });
        }

        const body = req.body || {};
        const { job_title, description, requirements, location, salary_range } = body;

        // 2. Basic Validation
        if (!job_title || !description || !requirements) {
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

        res.status(201).json(job);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create job', error: error.message });
    }
};

// @desc    Get all active jobs
// @route   GET /api/jobs
// @access  Public or Private (Seekers)
const getJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ status: 'active' }).populate('recruiter_id', 'company.company_name email');
        res.status(200).json(jobs);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch jobs', error: error.message });
    }
};

// @desc    Get AI ranked job recommendations for seeker
// @route   GET /api/jobs/recommendations
// @access  Private (Seeker only)
const getRecommendedJobs = async (req, res) => {
    try {
        if (req.user.user_type !== 'job_seeker') {
            return res.status(403).json({ message: 'Access denied.' });
        }

        const { search = '', location = '', experience = '', salaryMin = '' } = req.query;

        const query = { status: 'active' };
        if (search) {
            query.$or = [
                { job_title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { 'requirements.skills': { $regex: search, $options: 'i' } }
            ];
        }
        if (location) {
            query.location = { $regex: location, $options: 'i' };
        }
        if (salaryMin && Number.isFinite(Number(salaryMin))) {
            query['salary_range.min'] = { $gte: Number(salaryMin) };
        }
        if (experience && Number.isFinite(Number(experience))) {
            query['requirements.experience_years'] = { $lte: Number(experience) };
        }

        const [jobs, user] = await Promise.all([
            Job.find(query).populate('recruiter_id', 'company.company_name email'),
            User.findById(req.user._id).select('profile')
        ]);

        const ranked = jobs
            .map((job) => {
                const ai = computeMatchBreakdown(user, job);
                return {
                    ...job.toObject(),
                    ai_match_score: ai.match_score,
                    hiring_probability: ai.hiring_probability,
                    match_reasons: ai.reasons,
                    missing_skills: ai.missing_skills
                };
            })
            .sort((a, b) => b.ai_match_score - a.ai_match_score);

        return res.status(200).json(ranked);
    } catch (error) {
        return res.status(500).json({ message: 'Failed to fetch recommendations', error: error.message });
    }
};

// @desc    Get jobs posted by the logged-in recruiter
// @route   GET /api/jobs/me
// @access  Private (Recruiter only)
const getMyJobs = async (req, res) => {
    try {
        if (req.user.user_type !== 'recruiter') return res.status(403).json({ message: 'Access denied.' });
        const jobs = await Job.find({ recruiter_id: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json(jobs);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch jobs', error: error.message });
    }
};

// @desc    Update recruiter-owned job
// @route   PUT /api/jobs/:id
// @access  Private (Recruiter only)
const updateJob = async (req, res) => {
    try {
        if (req.user.user_type !== 'recruiter') {
            return res.status(403).json({ message: 'Access denied.' });
        }

        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ message: 'Job not found.' });
        }

        if (String(job.recruiter_id) !== String(req.user._id)) {
            return res.status(403).json({ message: 'Access denied.' });
        }

        const body = req.body || {};
        const { job_title, description, requirements, location, salary_range } = body;

        if (job_title !== undefined) job.job_title = job_title;
        if (description !== undefined) job.description = description;
        if (location !== undefined) job.location = location;
        if (requirements !== undefined) job.requirements = requirements;
        if (salary_range !== undefined) job.salary_range = salary_range;

        const updated = await job.save();
        return res.status(200).json(updated);
    } catch (error) {
        return res.status(500).json({ message: 'Failed to update job', error: error.message });
    }
};

// @desc    Delete recruiter-owned job
// @route   DELETE /api/jobs/:id
// @access  Private (Recruiter only)
const deleteJob = async (req, res) => {
    try {
        if (req.user.user_type !== 'recruiter') {
            return res.status(403).json({ message: 'Access denied.' });
        }

        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ message: 'Job not found.' });
        }

        if (String(job.recruiter_id) !== String(req.user._id)) {
            return res.status(403).json({ message: 'Access denied.' });
        }

        await Application.deleteMany({ job_id: job._id });
        await job.deleteOne();

        return res.status(200).json({ message: 'Job deleted successfully.' });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to delete job', error: error.message });
    }
};

// @desc    Recruiter dashboard analytics
// @route   GET /api/jobs/analytics
// @access  Private (Recruiter only)
const getJobAnalytics = async (req, res) => {
    try {
        if (req.user.user_type !== 'recruiter') {
            return res.status(403).json({ message: 'Access denied.' });
        }

        const jobs = await Job.find({ recruiter_id: req.user._id }).select('_id status');
        const jobIds = jobs.map((j) => j._id);

        const applications = await Application.find({ job_id: { $in: jobIds } }).select('status ai_match_score');

        const scoreDistribution = { excellent: 0, good: 0, average: 0, poor: 0 };
        applications.forEach((app) => {
            const score = Number(app.ai_match_score || 0);
            if (score >= 80) scoreDistribution.excellent += 1;
            else if (score >= 60) scoreDistribution.good += 1;
            else if (score >= 40) scoreDistribution.average += 1;
            else scoreDistribution.poor += 1;
        });

        const funnel = {
            total_applied: applications.length,
            pending: applications.filter((a) => a.status === 'applied').length,
            shortlisted: applications.filter((a) => a.status === 'shortlisted').length,
            interviewing: applications.filter((a) => a.status === 'interviewing').length
        };

        return res.status(200).json({
            active_jobs: jobs.filter((j) => j.status === 'active').length,
            total_jobs: jobs.length,
            funnel,
            scoreDistribution
        });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to fetch analytics', error: error.message });
    }
};

module.exports = {
    createJob,
    getJobs,
    getMyJobs,
    getRecommendedJobs,
    updateJob,
    deleteJob,
    getJobAnalytics
};
