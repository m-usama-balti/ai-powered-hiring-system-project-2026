// server/routes/applicationRoutes.js
const express = require('express');
const router = express.Router();
const {
    applyForJob,
    getMyApplications,
    getJobApplications,
    updateApplicationStatus,
    getRecruiterAnalytics,
    getJobRecommendations,
    getSeekerAnalytics,
    getNotifications,
    getCareerAdvice,
    generateInterviewGuide
} = require('../controllers/applicationController');
const { protect, recruiterOnly } = require('../middleware/authMiddleware');

router.get('/me', protect, getMyApplications);
router.get('/analytics/seeker', protect, getSeekerAnalytics);
router.get('/notifications', protect, getNotifications);
router.get('/assistant', protect, getCareerAdvice);
router.get('/job/:jobId', protect, getJobApplications);
router.get('/job/:jobId/recommendations', protect, recruiterOnly, getJobRecommendations);
router.get('/analytics/recruiter', protect, recruiterOnly, getRecruiterAnalytics);
router.put('/:id/status', protect, recruiterOnly, updateApplicationStatus);
router.get('/:id/interview-guide', protect, generateInterviewGuide);

// The URL will look like: POST /api/applications/64abc123... (the job ID)
router.post('/:jobId', protect, applyForJob);

module.exports = router;
