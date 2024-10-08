const express = require('express');
const user_route = express.Router();
const passport = require("passport")
const userController = require("../controllers/user/userController");

user_route.get('/pageNotFound',userController.pageNotFound)
user_route.get('/', userController.loadHomePage);
user_route.get('/signup',userController.loadSignup);
user_route.post('/signup',userController.signup);
user_route.post('/verify-otp',userController.verifyOtp)
user_route.post("/resend-otp",userController.resendOtp);
user_route.get('/login',userController.loadlogin)

user_route.get('/auth/google',passport.authenticate('google',{scope:['profile','email']}))
user_route.get('/auth/google/callback',passport.authenticate('google',{failureRedirect: '/signup'}),(req,res) => {
    res.redirect('/')
})

module.exports = user_route;
