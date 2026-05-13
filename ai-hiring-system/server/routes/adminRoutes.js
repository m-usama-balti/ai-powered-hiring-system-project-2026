const express = require('express');
const router = express.Router();
const { getPendingJobs, reviewJob, approveJob, rejectJob, getSystemStats, getAnalytics } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/jobs/pending', protect, adminOnly, getPendingJobs);
router.put('/jobs/:id/approve', protect, adminOnly, approveJob);
router.put('/jobs/:id/reject', protect, adminOnly, rejectJob);
router.put('/jobs/:id/review', protect, adminOnly, reviewJob);
router.get('/system-stats', protect, adminOnly, getSystemStats);
router.get('/analytics', protect, adminOnly, getAnalytics);

module.exports = router;