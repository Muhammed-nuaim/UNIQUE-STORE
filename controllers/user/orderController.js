const User = require("../../models/userModel");
const Product = require("../../models/productModel");
const Category = require("../../models/CategoryModel");
const Address = require("../../models/addressModel");
const Cart =require("../../models/cartModel");
const Order = require("../../models/orderModel")

const getOrders = async(req,res) => {
    try {
        const user = req.session.user;

        const existingUser = await User.findOne({_id:user.id})
        const existingOrder = await Order.findMany({userId:existingUser._id,status:{ $ne: 'Delivered' }}).populate("orderedItems","address")

        if(existingOrder) {
            res.render('my-orders',{existingOrder,user})
        } else {
            res.redirect('/admin/page-error')
        }
    } catch (error) {
        res.status(500)
    }
}


const getOrderDetails = async (req,res) => {
    try {
        const id = req.query.id
        const user = req.session.user

        const existingUser = await User.findOne({_id:user.id});
        const orderDetails = await Order.findOne({_id:id}).populate("orderedItems","address")

        if(orderDetails,existingUser) {
            res.render('orderDetails',{orderDetails,user})
        } else {
            res.redirect('/pageNotFound')
        }
    } catch (error) {
        console.error(error,"server error")
    }
}

const cancellOrder = async(req,res) => {
    try {
        const id = req.body.orderId
        const user = req.session.user
        const existingUser = await User.findOne({_id:user.id});
        const orderDetails = await Order.findOne({_id:id})
        const status = orderDetails.status

        if(existingUser && orderDetails && status != 'Shipped') {
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
    getOrders,
    getOrderDetails,
    cancellOrder
}