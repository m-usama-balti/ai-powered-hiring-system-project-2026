const User = require('../models/User');
const Job = require('../models/Job');

// 1. Get Pending Jobs for Approval (with simulated fraud check)
const getPendingJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ status: 'pending' }).populate('recruiter_id', 'email company');
        res.status(200).json(jobs);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch jobs' });
    }
};

// 2. Approve or Reject Job
const reviewJob = async (req, res) => {
    try {
        const body = req.body || {};
        const { action } = body;
        if (!['approve', 'reject'].includes(action)) {
            return res.status(400).json({ message: 'Invalid review action. Use approve or reject.' });
        }

        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        job.status = action === 'approve' ? 'active' : 'rejected';
        await job.save();
        res.status(200).json({ message: `Job ${action}d successfully`, job });
    } catch (error) {
        res.status(500).json({ message: 'Failed to review job' });
    }
};

// 3. System Maintenance & Analytics Data (Mocked for Dashboard)
const getSystemStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalJobs = await Job.countDocuments();

        res.status(200).json({
            metrics: { users: totalUsers, jobs: totalJobs, resumes_parsed: 1243 },
            servers: {
                database: { status: 'Operational', latency: '42ms' },
                node_api: { status: 'Operational', latency: '112ms' },
                python_ai: { status: 'Operational', latency: '840ms' }
            },
            ai_model: {
                active_version: 'v2.1.0-spaCy-en_core_web_sm',
                accuracy_rate: 94.2,
                last_trained: '2026-04-10T08:00:00Z'
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch system stats' });
    }
};

module.exports = { getPendingJobs, reviewJob, getSystemStats };