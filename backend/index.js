import dotenv from "dotenv";

dotenv.config();
import express from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import cors from "cors";
import { fileURLToPath } from 'url';
import path from "path";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors({
    origin: process.env.FRONTEND_BASE_URL, // Frontend domain
    credentials: true, // Allow cookies to be sent with requests
}));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    // cookie: {
    //     httpOnly: true, // The cookie is not accessible by JavaScript
    //     secure: true, // Ensure the cookie is only sent over HTTPS
    //     sameSite: 'None', // Necessary for cross-origin cookies
    //     // domain: '.onrender.com' // Set the domain to your backend's domain (use `.onrender.com` for all subdomains)
    // }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    console.log(req.user);
    next();
})

passport.use(
    new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.BACKEND_BASE_URL + "/auth/google/callback", // is base required
    },
        (accessToken, refreshToken, profile, done) => {
            return done(null, profile);
        }
    )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

app.get("/api", (req, res) => {
    res.send("<a href='/auth/google'>Login with Google</a>");
});

app.get("/api/auth/google", passport.authenticate("google", { scope: ['profile', 'email'], prompt: "select_account" }));

app.get('/api/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
    // res.cookie('connect.sid', req.sessionID, {
    //     httpOnly: true,
    //     secure: true,
    //     // sameSite: 'None',
    //     // domain: '.onrender.com' // Match your backend's domain or a parent domain if needed
    // });
    res.redirect('/');
});

app.get("/api/profile", (req, res) => {
    res.send("Welcome to the profile page : " + req.user.displayName);
});

app.get("/api/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err); // Handle any logout errors
        req.session.destroy((err) => {
            if (err) return next(err); // Handle session destruction errors
            res.clearCookie("connect.sid"); // Clear the session cookie (default name in Express)
            return res.redirect('/');
        });
    });
});

app.get("/api/auth/status", (req, res) => {
    if (req.isAuthenticated()) {
        res.json({ loggedIn: true, user: req.user });
    } else {
        res.json({ loggedIn: false });
    }
});

app.use(express.static(path.join(__dirname,  'dist')));

// Fallback to index.html for all other routes (useful for React Router)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname,  'dist', 'index.html'));
});

app.listen(process.env.PORT, () => {
    console.log("Server is running on port " + process.env.PORT);
});