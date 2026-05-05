// server/routes/jobRoutes.js
const express = require('express');
const router = express.Router();
const {
	createJob,
	getJobs,
	getMyJobs,
	getRecommendedJobs,
	updateJob,
	deleteJob,
	getJobAnalytics
} = require('../controllers/jobController');
const { protect } = require('../middleware/authMiddleware');

router.get('/me', protect, getMyJobs);
router.get('/analytics', protect, getJobAnalytics);
router.get('/recommendations', protect, getRecommendedJobs);
router.get('/', getJobs);
router.post('/', protect, createJob);
router.route('/:id').put(protect, updateJob).delete(protect, deleteJob);

module.exports = router;
