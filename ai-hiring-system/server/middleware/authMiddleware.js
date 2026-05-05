// server/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    // Check if token is sent in the headers as "Bearer <token>"
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from the token payload (excluding password)
            req.user = await User.findById(decoded.id).select('-password');

            next(); // Move to the next middleware or route controller
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token provided' });
    }
};

const adminOnly = (req, res, next) => {
    if (req.user && req.user.user_type === 'admin') {
        return next();
    }

    return res.status(403).json({ message: 'Not authorized as admin' });
};

const recruiterOnly = (req, res, next) => {
    if (req.user && req.user.user_type === 'recruiter') {
        return next();
    }

    return res.status(403).json({ message: 'Not authorized as recruiter' });
};

module.exports = { protect, adminOnly, recruiterOnly };
