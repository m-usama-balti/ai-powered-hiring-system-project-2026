// server/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { registerUser, loginUser, updateProfile, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const passport = require('passport');
const jwt = require('jsonwebtoken');

// Helper to generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Public Routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

// --- SOCIAL OAUTH ROUTES ---

// Google Auth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
    const token = generateToken(req.user._id);
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/auth/success?token=${token}`);
});

// GitHub Auth
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback', passport.authenticate('github', { failureRedirect: '/login' }), (req, res) => {
    const token = generateToken(req.user._id);
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/auth/success?token=${token}`);
});

// LinkedIn Auth
router.get('/linkedin', passport.authenticate('linkedin', { state: 'SOME_STATE' }));
router.get('/linkedin/callback', passport.authenticate('linkedin', { failureRedirect: '/login' }), (req, res) => {
    const token = generateToken(req.user._id);
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/auth/success?token=${token}`);
});

// Example of a Protected Route (Get current user profile)
router.get('/me', protect, async (req, res) => {
    // req.user is set by the protect middleware
    res.status(200).json(req.user);
});
router.put('/me', protect, updateProfile);

module.exports = router;
