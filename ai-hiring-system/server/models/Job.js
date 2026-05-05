// server/models/Job.js
const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    recruiter_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    job_title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, default: 'Remote' },
    requirements: {
        skills: [{ type: String }],
        experience_years: { type: Number },
        education_level: { type: String }
    },
    salary_range: {
        min: { type: Number },
        max: { type: Number }
    },
    status: {
        type: String,
        enum: ['pending', 'active', 'rejected', 'closed'],
        default: 'pending'
    }
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);
