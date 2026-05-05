const express = require('express');
const router = express.Router();
const { getPendingJobs, reviewJob, getSystemStats } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/jobs/pending', protect, adminOnly, getPendingJobs);
router.put('/jobs/:id/review', protect, adminOnly, reviewJob);
router.get('/system-stats', protect, adminOnly, getSystemStats);

module.exports = router;