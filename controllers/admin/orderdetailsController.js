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
        res.status(500).send("Internal Server Error");
    }
}


const getOrderDetails = async(req,res) => {
    try {
        const id = req.query.id

        const orderDetails = await Order.findOne({_id:id}).populate("orderedItems.productId","address")

        if(orderDetails) {
          res.render("order-details",{orderDetails})
        } else {
            res.redirect("/admin/page-error")
        }
    } catch (error) {
        res.status(500).send("Internal Server Error");
    }
}

const updateStatus = async (req,res) => {
    try {
        const {orderId , status} = req.body

        const orderDetails = await Order.findOne({_id:orderId})
        
        if(orderId && status && orderDetails.cancelled !== true) {
            await Order.updateOne(
                {_id:orderId},
                {status:status}
            )
              res.status(200).json({success:true});
        } else {
            res.status(201).json({success:false});
        }
    } catch (error) {
        res.status(500).send("Internal Server Error");
    }
}

const cancellOrder = async(req,res) => {
    try {
        const id = req.body.orderId

        const orderDetails = await Order.findOne({_id:id})
        const status = orderDetails.status
        
        if(orderDetails && status != 'Shipped') {
            await Order.updateOne(
                {_id:id},
                {cancelled:true,status:"Cancelled"}
            )
            const productId = orderDetails.orderedItems.map((item) => item)
        for(let item of productId) {
            await Product.updateMany(
                {_id:item.productId},
                {$inc: {quantity:item.quantity}}
            )
        }

            res.status(200).json({success:true,message:"Order Cancelled Successfully"})
        } else {
            res.status(201).json({success:false,message:"Order is Already Shipped"})
        }
    } catch (error) {
        res.status(500).json({success:false,error})
    }
}

module.exports = {
    getOrderList,
    getOrderDetails,
    updateStatus,
    cancellOrder
}