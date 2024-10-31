const Product = require("../../models/productModel");
const Category = require("../../models/CategoryModel");
const User = require('../../models/userModel');
const Order = require('../../models/orderModel')


const getOrderList = async(req,res) => {
    try {
        const orderList = await Order.find({}).populate("orderedItems.productId","address")
        if(orderList) {
        res.render("order-list",{orderList})
        } else {
            res.render("order-list",{orderList:false})
        }
    } catch (error) {
        
    }
}


const getOrderDetails = async(req,res) => {
    try {
        const id = req.query.id

        const orderDetails = await Order.findOne({_id:id})

        if(orderDetails) {
          res.render("order-details",{orderDetails})
        } else {
            res.redirect("/admin/page-error")
        }
    } catch (error) {
        
    }
}

module.exports = {
    getOrderList,
    getOrderDetails,
}