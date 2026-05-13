// server/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    user_type: {
        type: String,
        enum: ['job_seeker', 'recruiter', 'admin'],
        required: true
    },
    // Job Seeker specific fields (can be null for recruiters)
    profile: {
        name: { type: String },
        skills: [{ type: String }],
        experience: { type: String },
        education: { type: String },
        resume_url: { type: String },
        preferences: {
            desired_location: { type: String },
            salary_expectation: { type: Number },
            job_type: { type: String }
        },
        linkedin: { type: String, default: '' },
        github: { type: String, default: '' },
        portfolio_links: [{ type: String }],
    },
    // Recruiter specific fields
    company: {
        company_name: { type: String },
        company_size: { type: String },
        location: { type: String },
        is_verified: { type: Boolean, default: false }
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,

    // OAuth Provider Fields
    googleId: { type: String, unique: true, sparse: true },
    githubId: { type: String, unique: true, sparse: true },
    linkedinId: { type: String, unique: true, sparse: true },
}, { timestamps: true });

// Mongoose async middleware should not use `next`; return/throw instead.
userSchema.pre('save', async function () {
    // Only hash the password if it has been modified (or is new) AND it's not an OAuth user
    if (!this.isModified('password') || (this.googleId || this.githubId || this.linkedinId)) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// ADD THIS METHOD to generate and hash the password token
userSchema.methods.getResetPasswordToken = function () {
    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Set expire to 10 minutes from now
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    return resetToken; // Return the unhashed token to send in the email
};

module.exports = mongoose.model('User', userSchema);
