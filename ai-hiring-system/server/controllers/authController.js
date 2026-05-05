// server/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

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
            return res.status(400).json({ message: 'Please add all required fields' });
        }

        // 2. Check if user already exists
        const userExists = await User.findOne({ email: normalizedEmail });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // 3. SECURITY LOCK: require secret for admin account creation
        if (normalizedUserType === 'admin') {
            const expectedSecret = process.env.ADMIN_REGISTER_SECRET;
            if (!expectedSecret || adminSecret !== expectedSecret) {
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
            res.status(201).json({
                _id: user.id,
                email: user.email,
                user_type: user.user_type,
                token: generateToken(user._id)
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const body = normalizeBody(req);
        const { email, password } = body;

        // 1. Find user by email
        const user = await User.findOne({ email });

        // 2. Verify password and send back a sanitized user object
        if (user && (await bcrypt.compare(password, user.password))) {
            // IMPORTANT: Never send the entire user object back.
            // Even with a hashed password, it's a security risk.
            res.json({
                _id: user._id, // Use _id for consistency with Mongoose
                email: user.email,
                user_type: user.user_type,
                token: generateToken(user._id),
            });
        } else {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update user profile data (manual override for AI matchmaking)
// @route   PUT /api/auth/me
// @access  Private
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const incomingProfile = req.body.profile && typeof req.body.profile === 'object'
            ? req.body.profile
            : req.body;

        user.profile = {
            ...(user.profile || {}),
            skills: incomingProfile.skills ?? user.profile?.skills,
            experience_years: incomingProfile.experience_years ?? user.profile?.experience_years,
            desired_location: incomingProfile.desired_location ?? user.profile?.desired_location,
            job_type: incomingProfile.job_type ?? user.profile?.job_type,
            salary_expectation: incomingProfile.salary_expectation ?? user.profile?.salary_expectation,
            experience: incomingProfile.experience ?? user.profile?.experience,
            education: incomingProfile.education ?? user.profile?.education,
            preferences: incomingProfile.preferences ?? user.profile?.preferences,
            name: incomingProfile.name ?? user.profile?.name
        };

        const updatedUser = await user.save();

        return res.status(200).json({
            _id: updatedUser._id,
            email: updatedUser.email,
            user_type: updatedUser.user_type,
            profile: updatedUser.profile
        });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to update profile', error: error.message });
    }
};

const updateMyProfile = updateUserProfile;

// @desc    Forgot Password - Generates token and sends email
// @route   POST /api/auth/forgotpassword
// @access  Public
const forgotPassword = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(404).json({ message: 'There is no user with that email' });

        // Get reset token
        const resetToken = user.getResetPasswordToken();
        await user.save({ validateBeforeSave: false }); // Save the token and expiry to DB

        // Create reset url (pointing to your React frontend)
        const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

        const message = `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px; max-width: 600px;">
                <h2 style="color: #4f46e5;">Password Reset Request</h2>
                <p>You are receiving this email because you (or someone else) has requested the reset of a password.</p>
                <p>Please click the button below to reset your password. This link is valid for 10 minutes.</p>
                <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 10px;">Reset Password</a>
                <p style="margin-top: 20px; font-size: 12px; color: #64748b;">If you did not request this, please ignore this email and your password will remain unchanged.</p>
            </div>
        `;

        try {
            await sendEmail({ email: user.email, subject: 'Password Reset Token', html: message });
            res.status(200).json({ success: true, message: 'Email sent' });
        } catch (error) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });
            return res.status(500).json({ message: 'Email could not be sent' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Reset Password - Verifies token and updates password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
const resetPassword = async (req, res) => {
    try {
        // Get hashed token to compare with database
        const resetPasswordToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() } // Ensure token hasn't expired
        });

        if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

        // Set new password
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.status(200).json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { registerUser, loginUser, updateUserProfile, updateMyProfile, forgotPassword, resetPassword };
