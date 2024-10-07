const express = require('express');
const user_route = express.Router();  // Use Router
const userController = require("../controllers/user/userController");
const nocache = require('nocache');

user_route.get('/pageNotFound',userController.pageNotFound)
user_route.get('/', userController.loadHomePage);

module.exports = user_route;
