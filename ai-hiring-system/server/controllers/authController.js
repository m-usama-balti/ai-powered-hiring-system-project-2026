// server/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const logger = require('../utils/logger');

const normalizeBody = (req) => {
    if (req && req.body && typeof req.body === 'object') {
        return req.body;
    }

    if (req && typeof req.body === 'string') {
        try {
            return JSON.parse(req.body);
        } catch (_error) {
            return {};
        }
    }

    return {};
};

// Helper function to generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register a new user (Seeker, Recruiter, Admin)
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const requestId = req.id;
    try {
        const body = normalizeBody(req);
        const { email, password, user_type, role, profile, company, fullName, companyName, companySize, location, adminSecret } = body;
        const normalizedEmail = String(email || '').trim().toLowerCase();
        const rawUserType = String(user_type || role || '').trim().toLowerCase();
        const normalizedFullName = String(fullName || '').trim();

        let normalizedUserType = '';
        if (['seeker', 'job_seeker', 'job-seeker'].includes(rawUserType)) {
            normalizedUserType = 'job_seeker';
        } else if (['recruiter', 'employer'].includes(rawUserType)) {
            normalizedUserType = 'recruiter';
        } else if (rawUserType === 'admin') {
            normalizedUserType = 'admin';
        }

        const profileInput = profile && typeof profile === 'object' ? profile : {};
        const companyInput = company && typeof company === 'object' ? company : {};

        // 1. Validation
        if (!normalizedFullName || !normalizedEmail || !password || !normalizedUserType) {
            logger.warn({ message: 'Registration failed: Missing required fields', requestId, body });
            return res.status(400).json({ message: 'Please add all required fields' });
        }

        // 2. Check if user already exists
        const userExists = await User.findOne({ email: normalizedEmail });
        if (userExists) {
            logger.warn({ message: 'Registration attempt for existing email', email: normalizedEmail, requestId });
            return res.status(400).json({ message: 'User already exists' });
        }

        // 3. SECURITY LOCK: require secret for admin account creation
        if (normalizedUserType === 'admin') {
            const expectedSecret = process.env.ADMIN_REGISTER_SECRET;
            if (!expectedSecret || adminSecret !== expectedSecret) {
                logger.warn({ message: 'Unauthorized attempt to create admin account', email: normalizedEmail, requestId });
                return res.status(401).json({ message: 'Not authorized to create an Admin account.' });
            }
        }

        // 4. Create User (Password is hashed automatically by our Mongoose pre-save hook!)
        const user = await User.create({
            email: normalizedEmail,
            password,
            user_type: normalizedUserType,
            profile: normalizedUserType === 'job_seeker'
                ? { ...profileInput, name: normalizedFullName || profileInput.name }
                : undefined,
            company: normalizedUserType === 'recruiter'
                ? {
                    ...companyInput,
                    company_name: companyName ?? companyInput.company_name,
                    company_size: companySize ?? companyInput.company_size,
                    location: location ?? companyInput.location
                }
                : undefined
        });

        if (user) {
            logger.info({ message: 'User registered successfully', userId: user.id, email: user.email, userType: user.user_type, requestId });
            res.status(201).json({
                _id: user.id,
                email: user.email,
                user_type: user.user_type,
                token: generateToken(user._id)
            });
        } else {
            logger.error({ message: 'User creation failed with invalid data', body, requestId });
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        logger.error({
            message: 'Server error during user registration',
            error: { message: error.message, stack: error.stack },
            requestId
        });
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const requestId = req.id;
    try {
        const body = normalizeBody(req);
        const { email, password } = body;

        // 1. Find user by email
        const user = await User.findOne({ email });

        // 2. Verify password and send back a sanitized user object
        if (user && (await bcrypt.compare(password, user.password))) {
            logger.info({ message: 'User logged in successfully', userId: user._id, email: user.email, requestId });
            res.json({
                _id: user._id,
                email: user.email,
                user_type: user.user_type,
                token: generateToken(user._id),
            });
        } else {
            logger.warn({ message: 'Invalid login attempt', email, requestId });
            return res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        logger.error({
            message: 'Server error during user login',
            error: { message: error.message, stack: error.stack },
            requestId
        });
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update user profile & preferences
// @route   PUT /api/auth/me
// @access  Private
const updateProfile = async (req, res) => {
    try {
        // req.user._id comes from your protect middleware
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // 1. Update Core Account Info
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;

        // ONLY update the password if the user actually typed a new one!
        if (req.body.password && req.body.password.trim() !== '') {
            user.password = req.body.password;
        }

        // Ensure the profile object exists
        if (!user.profile) user.profile = {};

        // 2. Update Social & External Links
        if (req.body.linkedin !== undefined) user.profile.linkedin = req.body.linkedin;
        if (req.body.github !== undefined) user.profile.github = req.body.github;

        if (req.body.portfolio) {
            user.profile.portfolio_links = [req.body.portfolio];
        }

        // 3. Update Professional Preferences
        if (req.body.skills) user.profile.skills = req.body.skills;
        if (req.body.experience_years !== undefined) user.profile.experience_years = Number(req.body.experience_years);
        if (req.body.desired_location !== undefined) user.profile.desired_location = req.body.desired_location;
        if (req.body.job_type !== undefined) user.profile.job_type = req.body.job_type;
        if (req.body.salary_expectation !== undefined) user.profile.salary_expectation = req.body.salary_expectation;

        // Save everything to MongoDB
        const updatedUser = await user.save();

        // Send the updated data back to React
        res.status(200).json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            user_type: updatedUser.user_type,
            profile: updatedUser.profile
        });

    } catch (error) {
        console.error("Profile Update Error:", error);
        res.status(500).json({ message: 'Server error while updating profile', error: error.message });
    }
};

// @desc    Get current user's data
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    const requestId = req.id;
    try {
        const user = await User.findById(req.user._id).select('-password');

        if (!user) {
            logger.warn({ message: 'User not found for getMe', userId: req.user._id, requestId });
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        logger.error({
            message: 'Server error in getMe',
            error: { message: error.message, stack: error.stack },
            userId: req.user._id,
            requestId
        });
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Forgot Password - Generates token and sends email
// @route   POST /api/auth/forgotpassword
// @access  Public
const forgotPassword = async (req, res) => {
    const requestId = req.id;
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            logger.warn({ message: 'Password reset requested for non-existent user', email, requestId });
            return res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' });
        }

        const resetToken = user.getResetPasswordToken();
        await user.save({ validateBeforeSave: false });

        const resetUrl = `${req.protocol}://${req.get('host')}/resetpassword/${resetToken}`;

        const message = `
            <h1>You have requested a password reset</h1>
            <p>Please go to this link to reset your password:</p>
            <a href="${resetUrl}" clicktracking=off>${resetUrl}</a>
        `;

        try {
            await sendEmail({
                to: user.email,
                subject: 'Password Reset Request',
                text: message
            });
            logger.info({ message: 'Password reset email sent successfully', email, requestId });
            res.status(200).json({ success: true, data: 'Email sent' });
        } catch (err) {
            logger.error({
                message: 'Error sending password reset email',
                error: { message: err.message, stack: err.stack },
                email,
                requestId
            });
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });
            return res.status(500).json({ message: 'Email could not be sent' });
        }
    } catch (error) {
        logger.error({
            message: 'Server error in forgotPassword',
            error: { message: error.message, stack: error.stack },
            requestId
        });
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Reset Password - Verifies token and updates password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
const resetPassword = async (req, res) => {
    const requestId = req.id;
    try {
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.resettoken)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            logger.warn({ message: 'Invalid or expired password reset token used', token: req.params.resettoken, requestId });
            return res.status(400).json({ message: 'Invalid token' });
        }

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        logger.info({ message: 'Password reset successfully', userId: user._id, requestId });

        res.status(201).json({
            success: true,
            data: 'Password updated successfully',
            token: generateToken(user._id)
        });

    } catch (error) {
        logger.error({
            message: 'Server error in resetPassword',
            error: { message: error.message, stack: error.stack },
            requestId
        });
        res.status(500).json({ message: 'Server error' });
    }
};

// Cleaned up the exports!
module.exports = { 
    registerUser, 
    loginUser, 
    getMe, 
    updateProfile, 
    forgotPassword, 
    resetPassword 
};