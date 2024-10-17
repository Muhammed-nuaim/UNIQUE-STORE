const express = require('express');
const user_route = express.Router();
const passport = require("passport");
const userController = require("../controllers/user/userController");
const profileController = require("../controllers/user/profileController")
const shopController = require("../controllers/user/shopController")

// Error Management
user_route.get('/pageNotFound', userController.pageNotFound);

//Sign Up Management
user_route.get('/signup', userController.loadSignup);
user_route.post('/signup', userController.signup);
user_route.post('/verify-otp', userController.verifyOtp);
user_route.post("/resend-otp", userController.resendOtp);
user_route.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
user_route.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/signup' }), (req, res) => {req.session.user = { id: req.user._id, name: req.user.name, email: req.user.email };res.redirect('/');});

//Login Management
user_route.get('/login', userController.loadLogin);
user_route.post('/login', userController.login);


//Home page rendering
user_route.get('/', userController.loadHomePage);
user_route.get('/logout', userController.logout);

//profile Management
user_route.get("/forgot-password",profileController.getForgotPassPage);
user_route.post("/forgot-email-valid",profileController.forgotEmailValid);
user_route.post("/forgot-pass-verify-otp",profileController.verifyForgotPassOtp)
user_route.post("/forgot-resend-otp",profileController.resendOtp);
user_route.get("/reset-password",profileController.getResetPassPage);
user_route.post("/reset-password",profileController.newPassword);

//shop Management
user_route.get("/productDetails",shopController.getProductDetais);
user_route.get("/shopping",shopController.shoppingPage)
module.exports = user_route;
