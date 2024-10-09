const express = require("express")
const admin_route = express.Router()
const adminController = require("../controllers/admin/adminController")


admin_route.get("/login",adminController.loadLogin)
admin_route.post("/login",adminController.login)
admin_route.get("/",adminController.loadDashboard)


module.exports = admin_route