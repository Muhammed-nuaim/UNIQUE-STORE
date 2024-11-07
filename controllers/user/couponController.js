const User = require("../../models/userModel");
const Product = require("../../models/productModel");
const Category = require("../../models/CategoryModel");
const Address = require("../../models/addressModel");
const Cart =require("../../models/cartModel");
const Order = require("../../models/orderModel")
const Coupon = require("../../models/couponModel");

const applyCoupon = async(req,res) => {
    try {
        const {couponCode,subTotal} = req.body;
        const user = req.session.user;
        const existingUser = await User.findOne({_id:user.id});
        const existingCoupon = await Coupon.findOne({code:couponCode,isList:true}).populate("usage.userId")
        const existingCart = await Cart.findOne({userId:existingUser._id}).populate('items.productId')
        const currentDate = new Date()
        const applied = true
        
        if(existingCoupon && existingCart) {
        if(currentDate < existingCoupon.expireOn) {
            const existingCouponUser = await Coupon.findOne({code:couponCode,"usage.userId":existingUser._id})
            console.log(existingCouponUser);
            
            if(existingCouponUser) {
                if(existingCouponUser.usage.usageLimit < existingCoupon.usageLimit ) {
                    if(subTotal >= existingCoupon.minPurchaseAmount) {
                    const discountAmount = subTotal - (subTotal * (existingCoupon.discountPrice/100));
                        await Cart.updateOne(
                            {userId:existingUser._id},
                            {subTotal:discountAmount <= existingCoupon.maxDiscountAmount ? discountAmount : subTotal-existingCoupon.maxDiscountAmount}
                        )
                        await Coupon.updateOne(
                            {code:couponCode,"usage.userId":existingUser._id},
                            { $inc: { "usage.$.usageLimit": 1 } }
                        )
                        res.status(200).json({success:true,message:"This Coupon is SuccessFully applyied"})
                    } else {
                        res.status(201).json({success:false,message:`This is valid only minimum Purchase ${existingCoupon.minPurchaseAmount}`})
                    }
                } else {
                    res.status(201).json({success:false,message:"This Coupon is already reach at limit"})
                }
            } else{
                if(subTotal >= existingCoupon.minPurchaseAmount) {
                    const discountAmount = subTotal - (subTotal * (existingCoupon.discountPrice/100));
                        await Cart.updateOne(
                            {userId:existingUser._id},
                            {subTotal: discountAmount <= existingCoupon.maxDiscountAmount ? discountAmount : subTotal-existingCoupon.maxDiscountAmount }
                        )
                        await Coupon.updateOne(
                            {code:couponCode},
                            { $push:{ usage : {
                                userId:existingUser._id,
                                usageLimit:1
                            }
                            } }
                        )
                        res.status(200).json({success:true,message:"This Coupon is Successfully applyied"})
                    } else {
                        res.status(201).json({success:false,message:`This is valid only minimum Purchase ${existingCoupon.minPurchaseAmount}`})
                }
            }
        } else {
            res.status(201).json({success:false,message:`This Coupon is already expired in ${new Date(existingCoupon.expireOn).toDateString()}`})
        }
        } else {
            res.status(201).json({success:false,message:"This Coupon Code is Wrong, Please Try again"})
        }
        
    } catch (error) {
        console.error(error);
        res.status(500).json({success:false,message:"An error occured. Please try again"});
    }
}



module.exports = {
    applyCoupon,
}

