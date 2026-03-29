const express = require('express');
const { SignupController, LoginController, getCurrentUser } = require('../controlers/authController');
const authRoute = express.Router();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const UserDb = require('../models/user');
const jwt = require('jsonwebtoken');
const { requireAuth } = require('../middleware/authmiddleware');
require('dotenv').config();

// ----------------------
// SESSION MIDDLEWARE
// ----------------------
authRoute.use(
    session({
        secret: "your_secret_key",
        resave: false,
        saveUninitialized: false,
    })
);

authRoute.use(passport.initialize());
authRoute.use(passport.session());

// ----------------------
// PASSPORT SERIALIZATION
// ----------------------
passport.serializeUser((user, done) => {
    done(null, user._id);   // store user id
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await UserDb.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

// ----------------------
// GOOGLE STRATEGY (optional)
// ----------------------
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: "http://localhost:4444/auth/google/callback",
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    const { id, name, emails, photos } = profile;

                    const email = emails[0].value;

                    // Check if user already exists
                    let user = await UserDb.findOne({ email });

                    if (!user) {
                        // Create new Google user
                        user = await UserDb.create({
                            firstName: name.givenName,
                            lastName: name.familyName,
                            email: email,
                            googleId: id,
                            avatar: photos[0].value,
                            password: null
                        });
                    }

                    return done(null, user);
                } catch (err) {
                    return done(err, null);
                }
            }
        )
    );
} else {
    console.warn('Google OAuth not configured: set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to enable social login.');
}

// ----------------------
// ROUTES
// ----------------------
authRoute.post('/signup', SignupController);
authRoute.post('/login', LoginController);
// POST /auth/logout - clears the auth cookie
authRoute.post('/logout', (req, res) => {
    try {
        res.clearCookie('token');
        return res.json({ success: true, message: 'Logged out' });
    } catch (err) {
        console.error('Logout error', err);
        return res.status(500).json({ success: false, message: 'Logout failed' });
    }
});
authRoute.get('/singleUser', requireAuth, getCurrentUser);

authRoute.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

authRoute.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: "/login" }),
    async (req, res) => {

        // User is now available at req.user
        const user = req.user;

        // Create JWT
        const payload = { id: user._id, email: user.email };
        const token = jwt.sign(payload, process.env.JWT_SECRET || 'change_this_secret', { expiresIn: "7d" });

        // Set cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        // Redirect to frontend with token in query
        res.redirect(`${process.env.FRONTEND_URL || 'https://mericent-git-main-markcode.vercel.app'}/?token=${token}`);
    }
);

module.exports = authRoute;
