const express = require("express")
const admin_route = express.Router()
const customerController = require("../controllers/admin/customerController")
const adminController = require("../controllers/admin/adminController")
const {userAuth,adminAuth} = require("../middlewares/auth")


admin_route.get("/page-error",adminController.pageerror)
admin_route.get("/login",adminController.loadLogin)
admin_route.post("/login",adminController.login)
admin_route.get("/",adminAuth,adminController.loadDashboard)
admin_route.get("/logout",adminController.logout)
admin_route.get("/users",adminAuth,customerController.customerInfo)
admin_route.get("/blockCustomer",adminAuth,customerController.customerBlocked)
admin_route.get("/unblockCustomer",adminAuth,customerController.customerUnblocked)


module.exports = admin_route