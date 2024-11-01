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
        
        if(orderId,status) {
            await Order.updateOne(
                {_id:orderId},
                {status:status}
            )
            if(status == "Delivered" || status == "Shipped") {
              res.status(200).json({success:1});
            } else {
              res.status(200).json({success:2});
            }
        } else {
            res.status(201).json({success:false});
        }
    } catch (error) {
        res.status(500).send("Internal Server Error");
    }
}

const productCancelled = async (req,res) => {
    try {
        const {orderId,id} = req.body

        const order = await Order.findOne({_id:orderId,"orderedItems._id":id}).populate("orderedItems","address")
        const product = order.orderedItems.find(item => item._id == id)
       
        if(order && product) {
            await Order.updateOne(
                {_id:orderId,"orderedItems._id":id},
                { $set:{"orderedItems.$.cancelled":true}}
            )
            const orderDetails = order.orderedItems.find(item =>{ if (item.cancelled == false) {if(item._id!=id){ return item} }  })
            
            if(orderDetails){
                await Product.updateOne(
                    {_id:product.productId},
                    {$inc: {quantity:product.quantity}}
                )
                await Order.updateOne(
                    {_id:orderId,"orderedItems._id":id},
                    {$inc: {finalAmount: -product.totalPrice}}
                )
            res.status(200).json({success:1})
            } else {
                await Product.updateOne(
                    {_id:product.productId},
                    {$inc: {quantity:product.quantity}}
                )
                await Order.updateOne(
                    {_id:orderId},
                    {cancelled:true,
                    status:'Cancelled'
                    }
                )
                res.status(200).json({success:2})
            }
        } else {
            res.status(200).json({success:false})
        }
        
    } catch (error) {
        res.status(500).send("Internal Server Error");
    }
}

module.exports = {
    getOrderList,
    getOrderDetails,
    updateStatus,
    productCancelled
}