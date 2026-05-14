const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const compression = require('compression');
const connectDB = require('./config/db');
const passport = require('passport');
const session = require('express-session');
const logger = require('./utils/logger');
const { requestContext } = require('./middleware/requestContext');
require('./config/passport'); // Configure Passport strategies

// Load environment variables
dotenv.config();

// Initialize Database Connection
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.set('trust proxy', 1);

const parseOriginList = (value) => {
    if (!value) {
        return [];
    }

    return value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
};

const defaultAllowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5000',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
];

const allowedOrigins = [
    ...defaultAllowedOrigins,
    ...parseOriginList(process.env.CORS_ORIGINS),
    ...parseOriginList(process.env.FRONTEND_URL),
    ...parseOriginList(process.env.CLIENT_URL),
].filter(Boolean);

const originPatternToRegex = (pattern) => {
    const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`^${escaped.replace(/\\\*/g, '.*')}$`);
};

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin) {
            return callback(null, true);
        }

        const isAllowed = allowedOrigins.some((allowedOrigin) => {
            if (allowedOrigin.includes('*')) {
                return originPatternToRegex(allowedOrigin).test(origin);
            }

            return allowedOrigin === origin;
        });

        if (isAllowed) {
            return callback(null, true);
        }

        callback(new Error(`CORS not allowed for origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    optionsSuccessStatus: 200,
};

// Middleware
app.use(requestContext);
app.use(helmet({
    crossOriginResourcePolicy: false
}));
app.use(cors(corsOptions));
app.use(compression());
app.use(express.json({ limit: '2mb' })); // Parses incoming JSON payloads
app.use(express.urlencoded({ extended: true, limit: '2mb' })); // Parses URL-encoded payloads
app.use(express.text({ type: 'text/plain', limit: '2mb' })); // Supports raw text JSON bodies from API clients
app.use(hpp());

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false
});
app.use('/api', apiLimiter);

// Note: CORS middleware is applied globally via app.use(cors(corsOptions)) above.

// Express session middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'a-very-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24 // 24 hours
    }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Basic Health Route
app.get('/', (req, res) => {
    res.json({ message: "Node.js API is running securely." });
});

// API Health Route
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'node-api',
        timestamp: new Date().toISOString(),
        aiServiceUrl: process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000'
    });
});

// Import Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/resume', require('./routes/resumeRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/applications', require('./routes/applicationRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// 404 Not Found Handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
    const errorId = req.requestId || 'unknown';
    logger.error('request_error', {
        errorId,
        message: err.message,
        stack: err.stack,
        path: req.originalUrl,
        method: req.method
    });

    // CORS error
    if (err.message === 'CORS not allowed') {
        return res.status(403).json({ error: 'CORS not allowed', errorId });
    }

    res.status(err.status || 500).json({
        error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
        errorId
    });
});

// Server Initialization
const server = app.listen(PORT, () => {
    logger.info('server_started', {
        url: `http://localhost:${PORT}`,
        env: process.env.NODE_ENV || 'development',
        cors: process.env.FRONTEND_URL || 'localhost'
    });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('shutdown_signal', { signal: 'SIGTERM' });
    server.close(() => {
        logger.info('server_closed');
        process.exit(0);
    });
});
