// server/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    console.log('--- PROTECT MIDDLEWARE TRIGGERED ---');
    console.log('Request Path:', req.originalUrl);
    console.log('Authorization Header:', req.headers.authorization);

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            console.log('Token extracted:', token);

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('Token decoded successfully. User ID:', decoded.id);

            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                console.error('AUTH ERROR: User not found in database for ID:', decoded.id);
                return res.status(401).json({ message: 'Not authorized, user not found.' });
            }

            console.log('User authenticated successfully:', req.user.email);
            next();
        } catch (error) {
            console.error('AUTH ERROR: Token verification failed.', error.message);
            res.status(401).json({ message: `Not authorized, token failed: ${error.message}` });
        }
    } else {
        console.error('AUTH ERROR: No "Bearer" token found in Authorization header.');
        res.status(401).json({ message: 'Not authorized, no token or invalid token format.' });
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
