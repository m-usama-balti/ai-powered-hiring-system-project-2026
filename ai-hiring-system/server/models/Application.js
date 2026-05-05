// server/models/Application.js
const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    job_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Job', 
        required: true 
    },
    seeker_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    ai_match_score: { 
        type: Number, 
        default: 0 
    },
    parsed_resume_data: { 
        type: Object // Stores the exact JSON returned from your Python AI API
    },
    status: { 
        type: String, 
        enum: ['applied', 'shortlisted', 'interviewing', 'rejected', 'hired'], 
        default: 'applied' 
    }
}, { timestamps: true });

// Prevent a user from applying to the same job twice
applicationSchema.index({ job_id: 1, seeker_id: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
