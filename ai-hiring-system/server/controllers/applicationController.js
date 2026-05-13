// server/controllers/applicationController.js
const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const axios = require('axios');
const sendEmail = require('../utils/sendEmail');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';
const AI_MATCH_ENDPOINT = process.env.AI_MATCH_ENDPOINT || '/match';
const AI_TIMEOUT_MS = Number(process.env.AI_TIMEOUT_MS || 20000);

const APPLICATION_STATUSES = ['applied', 'shortlisted', 'interviewing', 'hired', 'rejected'];

const getAiMatchUrl = () => new URL(AI_MATCH_ENDPOINT, AI_SERVICE_URL).toString();

const normalizeStatus = (status) => String(status || '').trim().toLowerCase();

const normalizeSkills = (skills = []) =>
    skills
        .map((skill) => String(skill).trim().toLowerCase())
        .filter(Boolean);

const buildMissingSkills = (candidateSkills = [], requiredSkills = []) => {
    const candidateSet = new Set(normalizeSkills(candidateSkills));
    return normalizeSkills(requiredSkills).filter((skill) => !candidateSet.has(skill));
};

const extractExperienceYears = (experienceValue) => {
    if (!experienceValue) {
        return 0;
    }

    if (typeof experienceValue === 'number' && Number.isFinite(experienceValue)) {
        return experienceValue;
    }

    const match = String(experienceValue).match(/\d+/);
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

// @desc    Apply for a job and calculate AI Match Score
// @route   POST /api/applications/:jobId
// @access  Private (Seeker only)
const applyForJob = async (req, res) => {
    try {
        // 1. Security Check
        if (req.user.user_type !== 'job_seeker') {
            return res.status(403).json({ message: 'Only job seekers can apply for jobs.' });
        }

        const jobId = req.params.jobId;
        const seekerId = req.user._id;

        // 2. Prevent duplicate applications
        const existingApp = await Application.findOne({ job_id: jobId, seeker_id: seekerId });
        if (existingApp) {
            return res.status(400).json({ message: 'You have already applied for this job.' });
        }

        // 3. Fetch Job and User Data
        const job = await Job.findById(jobId);
        if (!job) return res.status(404).json({ message: 'Job not found.' });

        const user = await User.findById(seekerId);

        // 4. Check if user has uploaded a resume/parsed their profile
        if (!user.profile || !user.profile.skills || user.profile.skills.length === 0) {
            return res.status(400).json({ message: 'Please upload and parse your resume before applying.' });
        }

        // 5. Send data to Python AI Engine for Matchmaking
        console.log('Sending candidate and job data to AI Engine for matchmaking...');

        const payload = {
            candidate_skills: user.profile.skills || [],
            job_skills: job.requirements.skills || [],
            candidate_experience: extractExperienceYears(user.profile.experience),
            job_experience: job.requirements.experience_years || 0,
            candidate_education: user.profile.education || '',
            job_education: job.requirements.education_level || '',
            candidate_preferences: {
                desired_location: user.profile.preferences?.desired_location || '',
                job_type: user.profile.preferences?.job_type || ''
            },
            job_preferences: {
                location: job.location || ''
            }
        };

        const pythonResponse = await axios.post(getAiMatchUrl(), payload, { timeout: AI_TIMEOUT_MS });
        const matchScore = pythonResponse.data.match_score;
        const parsedResumeData = {
            match_score: pythonResponse.data.match_score,
            breakdown: pythonResponse.data.breakdown,
            missing_skills: pythonResponse.data.missing_skills || [],
            recommendations: pythonResponse.data.recommendations || [],
            ai_confidence_score: pythonResponse.data.ai_confidence_score,
            semantic_similarity: pythonResponse.data.semantic_similarity
        };

        // 6. Save the Application with the AI Score
        const application = await Application.create({
            job_id: jobId,
            seeker_id: seekerId,
            ai_match_score: matchScore,
            parsed_resume_data: parsedResumeData,
            status: 'applied'
        });

        res.status(201).json({
            message: 'Application submitted successfully!',
            match_score: matchScore,
            application
        });
    } catch (error) {
        console.error('Application Error:', error.message);
        res.status(500).json({ message: 'Failed to process application', error: error.message });
    }
};

// @desc    Get logged-in seeker's applications
// @route   GET /api/applications/me
// @access  Private (Seeker only)
const getMyApplications = async (req, res) => {
    try {
        if (req.user.user_type !== 'job_seeker') {
            return res.status(403).json({ message: 'Access denied.' });
        }

        const applications = await Application.find({ seeker_id: req.user._id })
            .populate({
                path: 'job_id',
                select: 'job_title location requirements status recruiter_id',
                populate: { path: 'recruiter_id', select: 'company' }
            })
            .sort({ createdAt: -1 });

        res.status(200).json(applications);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch your applications', error: error.message });
    }
};

// @desc    Get applications for a specific job posted by the recruiter
// @route   GET /api/applications/job/:jobId
// @access  Private (Recruiter only)
const getJobApplications = async (req, res) => {
    try {
        if (req.user.user_type !== 'recruiter') {
            return res.status(403).json({ message: 'Access denied.' });
        }

        const job = await Job.findById(req.params.jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found.' });
        }

        if (String(job.recruiter_id) !== String(req.user._id)) {
            return res.status(403).json({ message: 'Access denied.' });
        }

        const applications = await Application.find({ job_id: req.params.jobId })
            .populate('seeker_id', 'email profile')
            .sort({ ai_match_score: -1, createdAt: -1 })
            .lean();

        const jobSkills = normalizeSkills(job.requirements?.skills || []);

        const enrichedApplications = applications.map((application) => {
            const candidateSkills = application.seeker_id?.profile?.skills || [];
            const parsedResumeData = application.parsed_resume_data || {};
            const missingSkills = Array.isArray(parsedResumeData.missing_skills) && parsedResumeData.missing_skills.length > 0
                ? parsedResumeData.missing_skills
                : buildMissingSkills(candidateSkills, jobSkills);

            return {
                ...application,
                parsed_resume_data: {
                    ...parsedResumeData,
                    missing_skills: missingSkills
                },
                missing_skills: missingSkills,
                status_label: application.status
            };
        });

        res.status(200).json(enrichedApplications);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch job applications', error: error.message });
    }
};

// @desc    Update application status (and trigger Email Notification)
// @route   PUT /api/applications/:id/status
// @access  Private (Recruiter only)
const updateApplicationStatus = async (req, res) => {
    try {
        if (req.user.user_type !== 'recruiter') return res.status(403).json({ message: 'Access denied.' });

        const application = await Application.findById(req.params.id)
            .populate('seeker_id', 'email')
            .populate({
                path: 'job_id',
                select: 'job_title recruiter_id',
                populate: { path: 'recruiter_id', select: 'company' }
            });

        if (!application) return res.status(404).json({ message: 'Application not found' });

        if (String(application.job_id?.recruiter_id?._id || application.job_id?.recruiter_id) !== String(req.user._id)) {
            return res.status(403).json({ message: 'Access denied.' });
        }

        const normalizedStatus = normalizeStatus(req.body.status);
        if (!APPLICATION_STATUSES.includes(normalizedStatus)) {
            return res.status(400).json({ message: 'Invalid application status.' });
        }

        const oldStatus = application.status;
        const newStatus = normalizedStatus;

        application.status = newStatus;
        await application.save();

        if (oldStatus !== newStatus) {
            const companyName = application.job_id?.recruiter_id?.company?.company_name || 'A company';
            const jobTitle = application.job_id?.job_title || 'this role';
            const seekerEmail = application.seeker_id?.email;

            let emailSubject = '';
            let emailHtml = '';

            if (newStatus === 'shortlisted') {
                emailSubject = `Congratulations! You've been shortlisted for ${jobTitle}`;
                emailHtml = `
                    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px; max-width: 600px;">
                        <h2 style="color: #4f46e5;">Great news!</h2>
                        <p>Your AI Match Score was highly competitive, and <strong>${companyName}</strong> has officially shortlisted your application for the <strong>${jobTitle}</strong> position.</p>
                        <p>The recruiter is currently reviewing your profile and will reach out shortly regarding the next steps.</p>
                        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                        <p style="font-size: 12px; color: #64748b;">This is an automated message from your AI Hiring Portal.</p>
                    </div>
                `;
            } else if (newStatus === 'interviewing') {
                emailSubject = `Interview Request: ${jobTitle} at ${companyName}`;
                emailHtml = `
                    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px; max-width: 600px;">
                        <h2 style="color: #10b981;">Interview Time!</h2>
                        <p><strong>${companyName}</strong> would like to schedule an interview with you for the <strong>${jobTitle}</strong> position.</p>
                        <p>Please log in to your Career Portal to view messages from the recruiter and coordinate a time.</p>
                    </div>
                `;
            } else if (newStatus === 'rejected') {
                emailSubject = `Update on your application for ${jobTitle}`;
                emailHtml = `
                    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px; max-width: 600px;">
                        <h2 style="color: #64748b;">Application Update</h2>
                        <p>Thank you for applying to <strong>${companyName}</strong> for the <strong>${jobTitle}</strong> role.</p>
                        <p>While your profile is impressive, the team has decided to move forward with other candidates who have a higher AI Match alignment for this specific role.</p>
                        <p>We encourage you to use the Resume Intelligence tool on your dashboard to identify skill gaps for future roles.</p>
                    </div>
                `;
            }

            if (emailSubject && seekerEmail) {
                sendEmail({
                    email: seekerEmail,
                    subject: emailSubject,
                    html: emailHtml
                });
            }
        }

        res.status(200).json(application);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update status', error: error.message });
    }
};

// @desc    Recruiter analytics for dashboard charts and KPI cards
// @route   GET /api/applications/analytics/recruiter
// @access  Private (Recruiter only)
const getRecruiterAnalytics = async (req, res) => {
    try {
        if (req.user.user_type !== 'recruiter') {
            return res.status(403).json({ message: 'Access denied.' });
        }

        const jobs = await Job.find({ recruiter_id: req.user._id }).select('_id requirements job_title');
        const jobIds = jobs.map((job) => job._id);

        const applications = await Application.find({ job_id: { $in: jobIds } })
            .populate('seeker_id', 'email profile')
            .populate('job_id', 'job_title requirements')
            .sort({ ai_match_score: -1, createdAt: -1 });

        const totalApplicants = applications.length;
        const statusCounts = {
            applied: 0,
            shortlisted: 0,
            interviewing: 0,
            hired: 0,
            rejected: 0
        };

        for (const app of applications) {
            if (statusCounts[app.status] !== undefined) {
                statusCounts[app.status] += 1;
            }
        }

        const topCandidates = applications.slice(0, 10).map((app) => {
            const candidateSkills = app.seeker_id?.profile?.skills || [];
            const requiredSkills = app.job_id?.requirements?.skills || [];
            const missingSkills = requiredSkills.filter(
                (skill) => !candidateSkills.map((s) => s.toLowerCase()).includes(String(skill).toLowerCase())
            );

            return {
                application_id: app._id,
                candidate_email: app.seeker_id?.email,
                job_title: app.job_id?.job_title,
                match_score: app.ai_match_score,
                status: app.status,
                missing_skills: missingSkills.slice(0, 5)
            };
        });

        return res.status(200).json({
            kpis: {
                applicants: totalApplicants,
                shortlisted: statusCounts.shortlisted,
                hired: statusCounts.hired
            },
            pipeline: statusCounts,
            top_candidates: topCandidates
        });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to fetch recruiter analytics', error: error.message });
    }
};

// @desc    Candidate recommendations and skill gap for a job
// @route   GET /api/applications/job/:jobId/recommendations
// @access  Private (Recruiter only)
const getJobRecommendations = async (req, res) => {
    try {
        if (req.user.user_type !== 'recruiter') {
            return res.status(403).json({ message: 'Access denied.' });
        }

        const job = await Job.findById(req.params.jobId);
        if (!job) return res.status(404).json({ message: 'Job not found.' });

        if (String(job.recruiter_id) !== String(req.user._id)) {
            return res.status(403).json({ message: 'Access denied.' });
        }

        const apps = await Application.find({ job_id: req.params.jobId })
            .populate('seeker_id', 'email profile')
            .sort({ ai_match_score: -1, createdAt: -1 });

        const requiredSkills = (job.requirements?.skills || []).map((s) => String(s).toLowerCase());

        const recommendations = apps.map((app) => {
            const candidateSkillsRaw = app.seeker_id?.profile?.skills || [];
            const candidateSkills = candidateSkillsRaw.map((s) => String(s).toLowerCase());
            const missingSkills = requiredSkills.filter((skill) => !candidateSkills.includes(skill));

            return {
                application_id: app._id,
                candidate_email: app.seeker_id?.email,
                match_score: app.ai_match_score,
                status: app.status,
                recommended_action: app.ai_match_score >= 80 ? 'shortlist' : app.ai_match_score >= 60 ? 'review' : 'hold',
                missing_skills: missingSkills.slice(0, 5)
            };
        });

        return res.status(200).json({
            job_id: job._id,
            job_title: job.job_title,
            required_skills: job.requirements?.skills || [],
            recommendations
        });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to fetch recommendations', error: error.message });
    }
};

// @desc    Seeker analytics for intelligent dashboard
// @route   GET /api/applications/analytics/seeker
// @access  Private (Seeker only)
const getSeekerAnalytics = async (req, res) => {
    try {
        if (req.user.user_type !== 'job_seeker') {
            return res.status(403).json({ message: 'Access denied.' });
        }

        const [user, applications] = await Promise.all([
            User.findById(req.user._id).select('profile'),
            Application.find({ seeker_id: req.user._id }).sort({ createdAt: -1 })
        ]);

        const profileCompletion = calculateProfileCompletion(user?.profile || {});
        const totalApplications = applications.length;
        const interviewsScheduled = applications.filter((a) => a.status === 'interviewing').length;
        const avgMatch = totalApplications
            ? applications.reduce((sum, app) => sum + Number(app.ai_match_score || 0), 0) / totalApplications
            : 0;
        const employabilityScore = Math.round((avgMatch * 0.75) + (profileCompletion * 0.25));

        return res.status(200).json({
            profile_completion: profileCompletion,
            employability_score: employabilityScore,
            total_applications: totalApplications,
            interviews_scheduled: interviewsScheduled,
            recommended_jobs: 0,
            behavior_insights: {
                note: totalApplications < 3
                    ? 'Increase quality applications to improve response rate.'
                    : 'Consistent applications detected. Continue targeted applications.'
            }
        });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to fetch seeker analytics', error: error.message });
    }
};

// @desc    Get Seeker Notifications (Based on Application Statuses)
// @route   GET /api/applications/notifications
// @access  Private
const getNotifications = async (req, res) => {
    try {
        if (req.user.user_type !== 'job_seeker') {
            return res.status(403).json({ message: 'Access denied.' });
        }

        const applications = await Application.find({ seeker_id: req.user._id })
            .populate('job_id', 'job_title recruiter_id')
            .sort({ updatedAt: -1 });

        const notifications = [];
        applications.forEach((app) => {
            if (app.status === 'shortlisted') {
                notifications.push({
                    id: `${app._id}short`,
                    type: 'success',
                    title: 'You were Shortlisted!',
                    message: `Your application for ${app.job_id?.job_title || 'this role'} was shortlisted.`,
                    date: app.updatedAt
                });
            } else if (app.status === 'interviewing') {
                notifications.push({
                    id: `${app._id}int`,
                    type: 'info',
                    title: 'Interview Requested',
                    message: `The recruiter wants to schedule an interview for ${app.job_id?.job_title || 'this role'}.`,
                    date: app.updatedAt
                });
            } else if (app.status === 'rejected') {
                notifications.push({
                    id: `${app._id}rej`,
                    type: 'error',
                    title: 'Update on Application',
                    message: `Your application for ${app.job_id?.job_title || 'this role'} was not selected.`,
                    date: app.updatedAt
                });
            }
        });

        return res.status(200).json(notifications);
    } catch (error) {
        return res.status(500).json({ message: 'Failed to fetch notifications', error: error.message });
    }
};

// @desc    Get AI Career Advice based on Profile
// @route   GET /api/applications/assistant
// @access  Private
const getCareerAdvice = async (req, res) => {
    try {
        if (req.user.user_type !== 'job_seeker') {
            return res.status(403).json({ message: 'Access denied.' });
        }

        const profile = req.user.profile || {};
        const skills = profile.skills || [];
        const advice = [];
        const years = Number(profile.experience_years || 0);

        if (skills.length === 0) {
            advice.push('Your profile is missing technical skills. Upload your resume or manually add skills in the Profile tab so our AI can match you with jobs.');
        } else if (skills.length < 5) {
            advice.push(`You have listed ${skills.length} skills. Adding adjacent skills (e.g., if you know React, add Redux or Tailwind) can increase your match score by up to 15%.`);
        } else {
            advice.push(`Great job! You have a strong technical foundation with ${skills.length} skills recognized by our NLP engine.`);
        }

        if (years === 0) {
            advice.push('As an entry-level candidate, focus on building a strong GitHub portfolio. Emphasize personal projects on your resume to boost your hiring probability.');
        } else if (years > 5) {
            advice.push(`With ${years} years of experience, you qualify for Senior roles. Make sure your resume highlights leadership and architectural decisions.`);
        }

        return res.status(200).json({
            advice,
            employability_score: skills.length > 5 ? 85 : 55
        });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to generate advice', error: error.message });
    }
};

// @desc    Generate customized AI Interview Questions based on skill gaps
// @route   GET /api/applications/:id/interview-guide
// @access  Private (Recruiter only)
const generateInterviewGuide = async (req, res) => {
    try {
        if (req.user.user_type !== 'recruiter') return res.status(403).json({ message: 'Access denied.' });

        const application = await Application.findById(req.params.id)
            .populate('seeker_id', 'profile email')
            .populate('job_id', 'requirements job_title');

        if (!application) return res.status(404).json({ message: 'Application not found' });

        const jobSkills = application.job_id.requirements.skills.map(s => s.toLowerCase());
        const candidateSkills = application.seeker_id.profile?.skills?.map(s => s.toLowerCase()) || [];

        // Identify exact gaps
        const missingSkills = jobSkills.filter(skill => !candidateSkills.includes(skill));
        const matchedSkills = jobSkills.filter(skill => candidateSkills.includes(skill));

        // Generate dynamic question banks based on the data
        const questions = [];

        // 1. Probe the missing skills
        if (missingSkills.length > 0) {
            questions.push({
                category: 'Skill Gap Probe',
                question: `This role requires ${missingSkills[0]}, which isn't on your resume. How would you approach learning this, and can you share an example of a time you had to pick up a new technology quickly?`,
                intent: 'Assess adaptability and learning speed.'
            });
        }

        // 2. Validate the matched skills
        if (matchedSkills.length > 0) {
            questions.push({
                category: 'Technical Validation',
                question: `I see you have experience with ${matchedSkills[0]}. Can you describe the most complex problem you solved using this technology?`,
                intent: 'Verify the depth of their claimed experience.'
            });
        }

        // 3. Experience alignment
        const jobExp = application.job_id.requirements.experience_years;
        const candExp = application.seeker_id.profile?.experience_years || 0;

        if (candExp < jobExp) {
            questions.push({
                category: 'Experience Stretch',
                question: `This role typically requires ${jobExp} years of experience, but you have ${candExp}. Why do you feel your specific experiences make you ready to step up into this level of responsibility?`,
                intent: 'Determine if the candidate punches above their weight class.'
            });
        } else {
            questions.push({
                category: 'Leadership & Scaling',
                question: `Given your strong background, how do you typically mentor junior team members or lead architectural discussions?`,
                intent: 'Assess senior-level soft skills.'
            });
        }

        res.status(200).json({
            job_title: application.job_id.job_title,
            candidate: application.seeker_id.email,
            questions
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to generate interview guide', error: error.message });
    }
};

const getSeekerNotifications = getNotifications;
const askCareerAssistant = getCareerAdvice;

module.exports = {
    applyForJob,
    getMyApplications,
    getJobApplications,
    updateApplicationStatus,
    getRecruiterAnalytics,
    getJobRecommendations,
    getSeekerAnalytics,
    getNotifications,
    getCareerAdvice,
    getSeekerNotifications,
    askCareerAssistant,
    generateInterviewGuide
};
