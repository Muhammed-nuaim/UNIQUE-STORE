const User = require("../../models/userModel");
const Product = require("../../models/productModel");
const Category = require("../../models/CategoryModel");
const Address = require("../../models/addressModel");
const Cart =require("../../models/cartModel");
const Order = require("../../models/orderModel")
const Coupon = require("../../models/couponModel");


const loadCheckout = async(req,res) => {
    try {
        const user = req.session.user;
        const couponApply = req.session.coupon ? req.session.coupon : false
        const existingUser = await User.findOne({_id:user.id})
        const cart = await Cart.findOne({userId:existingUser._id}).populate('items.productId')
        const address = await Address.findOne({userId:existingUser._id})
        
        if(cart && existingUser && address) {
            if(cart.items.length > 0) {
                res.render('checkoutPage', {user , cart , cartData: cart.items , addressData:address.addresses , couponApply })
            } else {
                res.status(201).json({success:false,message:"Your cart is empty. Add products to continue."})
            }
        } else {
            res.redirect('/pageNotFound');
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({success:false,message:"An error occured. Please try again"});
    }
}

const saveOrder = async (req,res) => {
    try {
        const user = req.session.user;
        const {addressId , paymentMethod} = req.body

        const existingUser = await User.findOne({_id:user.id});
        const address = await Address.findOne({"addresses._id":addressId})
        
        const cart = await Cart.findOne({userId:existingUser}).populate("items.productId")
        const cartItems = cart.items.map( item => {
            if(item.productId) {
                return {
                    productId:item.productId,
                    productImage:item.productId.productImage[0],
                    productName:item.productId.productName,
                    quantity:item.Quantity,
                    price:item.price,
                    totalPrice:item.totalPrice,
                }
            }
        } )
        

        if(existingUser && address && cart) {
            const addressData = address.addresses.find(id => id._id == addressId);
            for (const item of cartItems) {
                await Product.updateOne(
                    { _id: item.productId },
                    { $inc: { quantity: -item.quantity } }
                );
            }
            if(addressData && paymentMethod) {
                const addToOrder = new Order({
                    userId: existingUser._id,
                    finalAmount: cart.subTotal,
                    paymentMethod: paymentMethod,
                    orderedItems: cartItems ,
                    address: [{
                        addressType:addressData.addressType,
                        name:addressData.name,
                        city:addressData.city,
                        landMark:addressData.landMark,
                        state:addressData.state,
                        pincode:addressData.pincode,
                        phone:addressData.phone,
                        altPhone:addressData.altPhone,
                    }]
                })
                await addToOrder.save();

                res.status(201).json({success:true})
            } else {
                res.status(400).json({success:false,message:"invalid address , Please choose another address"})
            }
        } else {
            res.status(400).json({success:false,message:"invalid address or user"})
        }
        
    } catch (error) {
        console.error(error);
        res.status(500).json({success:false,message:"An error occured. Please try again"});
    }
}

const orderSuccess = async(req,res) => {
    try {
        const user = req.session.user;
        const couponApply = req.session.coupon ? req.session.coupon : false
        const existingUser = await User.findOne({_id:user.id})
        const order = await Order.findOne({userId:existingUser._id}).sort({createdOn: -1 }).populate("orderedItems.productId","address")
        const cart = await Cart.findOne({userId:existingUser._id});

        if(cart) {
            await Cart.deleteOne({userId:existingUser._id})
            if(order && existingUser) {
                req.session.coupon = false
                res.render('order-success',{user ,couponApply,orderData: order})
            }
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({success:false,message:"An error occured. Please try again"});
    }
}


module.exports = {
    loadCheckout,
    saveOrder,
    orderSuccess,
}