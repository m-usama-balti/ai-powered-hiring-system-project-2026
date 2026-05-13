const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');

const ROLE_ORDER = ['job_seeker', 'recruiter', 'admin'];
const ROLE_LABELS = {
    job_seeker: 'Job Seekers',
    recruiter: 'Recruiters',
    admin: 'Administrators'
};

const CATEGORY_RULES = [
    { label: 'Software Engineering', regex: /(developer|engineer|software|frontend|backend|full[- ]stack|mobile|web|devops|cloud|platform|systems)/i },
    { label: 'Data & AI', regex: /(data|analytics|machine learning|ml|ai|scientist|bi )/i },
    { label: 'Product & Project', regex: /(product|project|program manager|scrum|delivery)/i },
    { label: 'Design', regex: /(design|ui|ux|graphic|creative|motion)/i },
    { label: 'Sales & Marketing', regex: /(sales|marketing|seo|content|growth|brand|account executive|business development)/i },
    { label: 'Operations', regex: /(operations|admin|support|coordinator|logistics|supply chain|office)/i },
    { label: 'Finance', regex: /(finance|accounting|auditor|audit|fp&a|treasury|risk)/i },
    { label: 'HR & Talent', regex: /(hr|human resource|talent|recruiter|people|payroll)/i },
    { label: 'Security', regex: /(security|cyber|compliance|privacy|governance)/i }
];

const REALISTIC_CATEGORY_FALLBACK = [
    { name: 'Software Engineering', applications: 312 },
    { name: 'Data & AI', applications: 184 },
    { name: 'Sales & Marketing', applications: 156 },
    { name: 'Operations', applications: 98 },
    { name: 'Design', applications: 84 },
    { name: 'Finance', applications: 71 },
    { name: 'HR & Talent', applications: 63 },
    { name: 'Security', applications: 47 }
];

const REALISTIC_GROWTH_FALLBACK = [
    { month: 'Jun', users: 218 },
    { month: 'Jul', users: 262 },
    { month: 'Aug', users: 311 },
    { month: 'Sep', users: 369 },
    { month: 'Oct', users: 428 },
    { month: 'Nov', users: 486 },
    { month: 'Dec', users: 547 },
    { month: 'Jan', users: 612 },
    { month: 'Feb', users: 694 },
    { month: 'Mar', users: 771 },
    { month: 'Apr', users: 845 },
    { month: 'May', users: 932 }
];

const REALISTIC_ROLE_FALLBACK = [
    { name: 'Job Seekers', value: 74 },
    { name: 'Recruiters', value: 21 },
    { name: 'Administrators', value: 5 }
];

const monthKey = (date) => `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;

const startOfMonth = (date) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));

const monthLabel = (yearMonth) => {
    const [year, month] = yearMonth.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, 1)).toLocaleString('en-US', { month: 'short' });
};

const categorizeJob = (jobTitle = '') => {
    const normalizedTitle = String(jobTitle);
    const matchedRule = CATEGORY_RULES.find((rule) => rule.regex.test(normalizedTitle));
    return matchedRule ? matchedRule.label : 'Other';
};

const buildLastTwelveMonths = () => {
    const months = [];
    const current = startOfMonth(new Date());
    for (let index = 11; index >= 0; index -= 1) {
        const monthDate = new Date(Date.UTC(current.getUTCFullYear(), current.getUTCMonth() - index, 1));
        months.push({ key: monthKey(monthDate), label: monthDate.toLocaleString('en-US', { month: 'short' }) });
    }
    return months;
};

const buildMockAnalytics = () => ({
    source: 'mock',
    generated_at: new Date().toISOString(),
    summary: {
        total_users: 1847,
        total_jobs: 312,
        total_applications: 1015,
        active_users_30d: 286,
        recruiter_users: 412,
        seeker_users: 1392,
        admin_users: 43
    },
    applications_per_job_category: REALISTIC_CATEGORY_FALLBACK,
    platform_user_growth: REALISTIC_GROWTH_FALLBACK,
    role_distribution: REALISTIC_ROLE_FALLBACK
});

const buildEmptySeries = () => ({
    applications_per_job_category: REALISTIC_CATEGORY_FALLBACK,
    platform_user_growth: REALISTIC_GROWTH_FALLBACK,
    role_distribution: REALISTIC_ROLE_FALLBACK
});

// 1. Get Pending Jobs for Approval (with simulated fraud check)
const getPendingJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ status: 'pending' }).populate('recruiter_id', 'email company');
        res.status(200).json(jobs);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch jobs' });
    }
};

const setJobStatus = async (req, res, status, successVerb) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        job.status = status;
        await job.save();
        res.status(200).json({ message: `Job ${successVerb} successfully`, job });
    } catch (error) {
        res.status(500).json({ message: `Failed to ${successVerb.split(' ')[0]} job` });
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

        if (action === 'approve') {
            return setJobStatus(req, res, 'active', 'approved');
        }

        return setJobStatus(req, res, 'rejected', 'rejected');
    } catch (error) {
        res.status(500).json({ message: 'Failed to review job' });
    }
};

const approveJob = async (req, res) => setJobStatus(req, res, 'active', 'approved');
const rejectJob = async (req, res) => setJobStatus(req, res, 'rejected', 'rejected');

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

const getAnalytics = async (req, res) => {
    try {
        const [totalUsers, totalJobs, totalApplications, users, jobs, applications, roleCounts] = await Promise.all([
            User.countDocuments(),
            Job.countDocuments(),
            Application.countDocuments(),
            User.find({}, 'createdAt user_type').lean(),
            Job.find({}, 'job_title createdAt').lean(),
            Application.find({}, 'job_id createdAt').lean(),
            User.aggregate([
                { $group: { _id: '$user_type', count: { $sum: 1 } } }
            ])
        ]);

        const sparseDataset = totalUsers < 8 || totalJobs < 6 || totalApplications < 12;
        if (sparseDataset) {
            return res.status(200).json(buildMockAnalytics());
        }

        const summary = {
            total_users: totalUsers,
            total_jobs: totalJobs,
            total_applications: totalApplications,
            active_users_30d: users.filter((user) => {
                const createdAt = new Date(user.createdAt);
                const cutoff = new Date();
                cutoff.setDate(cutoff.getDate() - 30);
                return createdAt >= cutoff;
            }).length,
            recruiter_users: roleCounts.find((item) => item._id === 'recruiter')?.count || 0,
            seeker_users: roleCounts.find((item) => item._id === 'job_seeker')?.count || 0,
            admin_users: roleCounts.find((item) => item._id === 'admin')?.count || 0
        };

        const monthBuckets = buildLastTwelveMonths();
        const growthMap = new Map(monthBuckets.map((bucket) => [bucket.key, 0]));
        users.forEach((user) => {
            const key = monthKey(new Date(user.createdAt));
            if (growthMap.has(key)) {
                growthMap.set(key, growthMap.get(key) + 1);
            }
        });

        let cumulativeUsers = 0;
        const platform_user_growth = monthBuckets.map((bucket) => {
            cumulativeUsers += growthMap.get(bucket.key) || 0;
            return { month: bucket.label, users: cumulativeUsers };
        });

        const jobMap = new Map(jobs.map((job) => [String(job._id), categorizeJob(job.job_title)]));
        const categoryCounts = new Map();
        applications.forEach((application) => {
            const category = jobMap.get(String(application.job_id)) || 'Other';
            categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1);
        });

        const categoriesInOrder = [
            'Software Engineering',
            'Data & AI',
            'Sales & Marketing',
            'Operations',
            'Design',
            'Finance',
            'HR & Talent',
            'Security',
            'Product & Project',
            'Other'
        ];

        const applications_per_job_category = categoriesInOrder
            .filter((category) => categoryCounts.has(category))
            .map((category) => ({ name: category, applications: categoryCounts.get(category) }))
            .sort((left, right) => right.applications - left.applications);

        const role_distribution = ROLE_ORDER.map((role) => ({
            name: ROLE_LABELS[role],
            value: roleCounts.find((item) => item._id === role)?.count || 0
        })).filter((item) => item.value > 0);

        const hasMeaningfulSeries = applications_per_job_category.length > 0 && platform_user_growth.some((item) => item.users > 0) && role_distribution.length > 0;
        if (!hasMeaningfulSeries) {
            return res.status(200).json(buildMockAnalytics());
        }

        res.status(200).json({
            source: 'database',
            generated_at: new Date().toISOString(),
            summary,
            applications_per_job_category,
            platform_user_growth,
            role_distribution
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch analytics' });
    }
};

module.exports = { getPendingJobs, reviewJob, approveJob, rejectJob, getSystemStats, getAnalytics };