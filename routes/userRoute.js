const express = require('express');
const user_route = express.Router();  // Use Router
const userController = require("../controllers/user/userController");
const nocache = require('nocache');

user_route.use(nocache());
user_route.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
});

user_route.use(express.urlencoded({ extended: true }));
user_route.use(express.json());

user_route.get('/', userController.loadHomePage);

module.exports = user_route;
