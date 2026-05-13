const crypto = require('crypto');
const logger = require('../utils/logger');

const generateId = () => {
    if (typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    return crypto.randomBytes(16).toString('hex');
};

const requestContext = (req, res, next) => {
    const requestId = req.headers['x-request-id'] || generateId();
    req.requestId = requestId;
    res.setHeader('x-request-id', requestId);

    const start = Date.now();
    res.on('finish', () => {
        const durationMs = Date.now() - start;
        logger.info('http_request', {
            requestId,
            method: req.method,
            path: req.originalUrl,
            status: res.statusCode,
            durationMs,
            ip: req.ip,
            userAgent: req.headers['user-agent'] || ''
        });
    });

    next();
};

module.exports = { requestContext };
