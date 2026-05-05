// server/routes/resumeRoutes.js
const express = require('express');
const router = express.Router();
const { uploadAndParseResume } = require('../controllers/resumeController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Protected route: Expects a file field named "resume" in the form data
router.post('/upload', protect, upload.single('resume'), uploadAndParseResume);

module.exports = router;
