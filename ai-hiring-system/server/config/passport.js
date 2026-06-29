const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GithubStrategy = require('passport-github2').Strategy;
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const User = require('../models/User');

const hasValue = (value) => typeof value === 'string' && value.trim() && value !== 'undefined' && value !== 'null';

const isGoogleConfigured = hasValue(process.env.GOOGLE_CLIENT_ID) && hasValue(process.env.GOOGLE_CLIENT_SECRET);
if (isGoogleConfigured) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/api/auth/google/callback'
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await User.findOne({ googleId: profile.id });
            if (user) {
                return done(null, user);
            }
            user = await User.create({
                googleId: profile.id,
                email: profile.emails[0].value,
                'profile.name': profile.displayName,
                user_type: 'job_seeker',
            });
            done(null, user);
        } catch (error) {
            done(error, null);
        }
    }));
} else {
    console.warn('Google OAuth disabled: set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET');
}

const isGithubConfigured = hasValue(process.env.GITHUB_CLIENT_ID) && hasValue(process.env.GITHUB_CLIENT_SECRET);
if (isGithubConfigured) {
    passport.use(new GithubStrategy({
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: '/api/auth/github/callback'
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await User.findOne({ githubId: profile.id });
            if (user) {
                return done(null, user);
            }
            user = await User.create({
                githubId: profile.id,
                email: profile.emails ? profile.emails[0].value : `${profile.username}@github.placeholder.com`,
                'profile.name': profile.displayName || profile.username,
                user_type: 'job_seeker',
            });
            done(null, user);
        } catch (error) {
            done(error, null);
        }
    }));
} else {
    console.warn('GitHub OAuth disabled: set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET');
}

const isLinkedinConfigured = hasValue(process.env.LINKEDIN_CLIENT_ID) && hasValue(process.env.LINKEDIN_CLIENT_SECRET);
if (isLinkedinConfigured) {
    passport.use(new LinkedInStrategy({
        clientID: process.env.LINKEDIN_CLIENT_ID,
        clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
        callbackURL: '/api/auth/linkedin/callback',
        scope: ['r_emailaddress', 'r_liteprofile'],
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await User.findOne({ linkedinId: profile.id });
            if (user) {
                return done(null, user);
            }
            user = await User.create({
                linkedinId: profile.id,
                email: profile.emails[0].value,
                'profile.name': profile.displayName,
                user_type: 'job_seeker',
            });
            done(null, user);
        } catch (error) {
            done(error, null);
        }
    }));
} else {
    console.warn('LinkedIn OAuth disabled: set LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET');
}

// Serialize and Deserialize User
// This is needed for session management, even if we use JWTs for API auth
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});