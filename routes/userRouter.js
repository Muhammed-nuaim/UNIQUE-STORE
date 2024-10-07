const express = require('express');
const user_route = express.Router();  // Use Router
const userController = require("../controllers/user/userController");

user_route.get('/pageNotFound',userController.pageNotFound)
user_route.get('/', userController.loadHomePage);
user_route.get('/signup',userController.loadSignup);
user_route.post('/signup',userController.signup);
user_route.get('/login',userController.loadlogin)

module.exports = user_route;
