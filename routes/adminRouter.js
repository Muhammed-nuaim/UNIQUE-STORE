const express = require("express");
const admin_route = express.Router();
const multer = require('multer'); // Import Multer
const customerController = require("../controllers/admin/customerController");
const adminController = require("../controllers/admin/adminController");
const categoryController = require("../controllers/admin/categoryController");
const productController = require("../controllers/admin/productController");
const { userAuth, adminAuth } = require("../middlewares/auth");

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/re-image'); // Define where the uploaded images will be stored
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
    }
});

const uploads = multer({ storage: storage }); // Create an instance of Multer

admin_route.get("/page-error", adminController.pageerror);
admin_route.get("/login", adminController.loadLogin);
admin_route.post("/login", adminController.login);
admin_route.get("/", adminAuth, adminController.loadDashboard);
admin_route.get("/logout", adminController.logout);
admin_route.get("/users", adminAuth, customerController.customerInfo);
admin_route.get("/blockCustomer", adminAuth, customerController.customerBlocked);
admin_route.get("/unblockCustomer", adminAuth, customerController.customerUnblocked);
admin_route.get("/category", adminAuth, categoryController.categoryInfo);
admin_route.post("/addCategory", adminAuth, categoryController.addCategory);
admin_route.get("/listCategory", adminAuth, categoryController.listCategory);
admin_route.get("/unlistCategory", adminAuth, categoryController.unlistCategory);
admin_route.get("/editCategory", adminAuth, categoryController.getEditCategory);
admin_route.post("/editCategory/:id", adminAuth, categoryController.editCategory);
admin_route.get("/deleteCategory", adminAuth, categoryController.deleteCategory);

// Product Management
admin_route.get("/addProducts", adminAuth, productController.getProductAddPage);
admin_route.post("/addProducts", adminAuth, uploads.array("images", 4), productController.addProducts); // Ensure the route uses uploads
admin_route.get("/products",adminAuth,productController.getAllProducts);
admin_route.get("/blockProduct",adminAuth,productController.blockProduct);
admin_route.get("/unblockProduct",adminAuth,productController.unblockProduct)



module.exports = admin_route;