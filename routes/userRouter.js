const express = require('express');
const user_route = express.Router();
const passport = require("passport");
const userController = require("../controllers/user/userController");

// Routes
user_route.get('/pageNotFound', userController.pageNotFound);
user_route.get('/', userController.loadHomePage);
user_route.get('/signup', userController.loadSignup);
user_route.post('/signup', userController.signup);
user_route.post('/verify-otp', userController.verifyOtp);
user_route.post("/resend-otp", userController.resendOtp);
user_route.get('/login', userController.loadLogin);
user_route.post('/login', userController.login);
user_route.get('/logout', userController.logout);

// Google authentication routes
user_route.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google callback route: Store user info in session after successful login
user_route.get('/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/signup' }), 
    (req, res) => {
        // Save user info (id, name, email) to session
        req.session.user = { id: req.user._id, name: req.user.name, email: req.user.email };
        res.redirect('/');
    }
);

module.exports = user_route;
