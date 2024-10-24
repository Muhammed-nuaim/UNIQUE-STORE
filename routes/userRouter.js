const express = require('express');
const user_route = express.Router();
const passport = require("passport");
const userController = require("../controllers/user/userController");
const profileController = require("../controllers/user/profileController")
const shopController = require("../controllers/user/shopController")
const whishlistController = require("../controllers/user/whishlistController")
const addressController = require("../controllers/user/addressController")
const { userAuth, adminAuth } = require("../middlewares/auth");

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
user_route.get("/userProfile",userAuth,profileController.userProfile);
user_route.put("/updateProfile",userAuth,profileController.updateProfile);

//address Management
user_route.post("/addAddress",userAuth,addressController.addAddress);

//shop Management
user_route.get("/productDetails",shopController.getProductDetais);
user_route.get("/shopping",shopController.shoppingPage)


//Whishlist Management
user_route.post("/addWhishlist",userAuth,whishlistController.addWhishlist);
user_route.get("/whishlist",userAuth,whishlistController.loadWhishlist);
user_route.delete("/removeWhishlist",userAuth,whishlistController.removeWhishlist);


module.exports = user_route;
