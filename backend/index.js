import dotenv from "dotenv";

dotenv.config();
import express from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import cors from "cors";


const app = express();
app.use(cors({
    origin: process.env.FRONTEND_BASE_URL, // Frontend domain
    credentials: true, // Allow cookies to be sent with requests
}));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true, // Ensures the cookie is only accessible via HTTP(S)
        secure: true, // Cookie is only sent over HTTPS
        sameSite: 'none', // Allows cookies in cross-origin requests
        domain: process.env.DOMAIN
    }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use((req,res,next)=>{
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

app.get("/", (req, res) => {
    res.send("<a href='/auth/google'>Login with Google</a>");
});

app.get("/auth/google", passport.authenticate("google", { scope: ['profile', 'email'], prompt: "select_account" }));

app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
    res.redirect(process.env.FRONTEND_BASE_URL);
});

app.get("/profile", (req, res) => {
    res.send("Welcome to the profile page : " + req.user.displayName);
});

app.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err); // Handle any logout errors
        req.session.destroy((err) => {
            if (err) return next(err); // Handle session destruction errors
            res.clearCookie("connect.sid"); // Clear the session cookie (default name in Express)
            return res.redirect(process.env.FRONTEND_BASE_URL);
        });
    });
});

app.get("/auth/status", (req, res) => {
    if (req.isAuthenticated()) {
        res.json({ loggedIn: true, user: req.user });
    } else {
        res.json({ loggedIn: false });
    }
});

app.listen(process.env.PORT, () => {
    console.log("Server is running on port " + process.env.PORT);
});