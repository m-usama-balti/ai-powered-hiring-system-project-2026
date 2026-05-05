const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const passport = require('passport');
const session = require('express-session');
require('./config/passport'); // Configure Passport strategies

// Load environment variables
dotenv.config();

// Initialize Database Connection
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Parses incoming JSON payloads
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded payloads
app.use(express.text({ type: 'text/plain' })); // Supports raw text JSON bodies from API clients

// Express session middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'a-very-secret-key',
    resave: false,
    saveUninitialized: true,
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Basic Health Route
app.get('/', (req, res) => {
    res.json({ message: "Node.js API is running securely." });
});

// Import Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/resume', require('./routes/resumeRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/applications', require('./routes/applicationRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
