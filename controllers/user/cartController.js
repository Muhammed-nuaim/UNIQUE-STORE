const User = require("../../models/userModel");
const Product = require("../../models/productModel");
const Category = require("../../models/CategoryModel");
const Address = require("../../models/addressModel");
const Cart =require("../../models/cartModel")

//loadcartpage
const loadCartPage = async (req,res) => {
    try {
        const user = req.session.user;

        const existingUser = await User.findOne({_id:user.id});
        const existingCart = await Cart.findOne({ userId: existingUser._id}).populate('items.productId')
            
        if(existingUser && !existingCart) {
            res.render('cartPage',{user , cartData:false , cart:false})
        } else if (existingCart && existingUser) {
            res.render('cartPage',{user , cartData:existingCart.items , cart:existingCart})
        }
    } catch (error) { 
        console.error(error);
        res.status(500).json({success:false,message:"An error occured. Please try again"});
    }
}

//addtocart
const addToCart = async (req,res) => {
    try {
        const id = req.body.id;
        const user = req.session.user;
        
        const existingUser = await User.findOne({_id:user.id});
        const existingProduct = await Product.findOne({_id:id});
        const productQuantity = existingProduct.quantity
        const existingCart = await Cart.findOne({userId:existingUser._id})
        const alreadyCart = await Cart.findOne({userId:existingUser._id,"items.productId":existingProduct._id})


        if(alreadyCart) {
            res.status(201).json({success:false,message:"Product is already in the cart"})
        }
        else if(existingProduct && existingUser &&!existingCart) {
            if(productQuantity > 0 ){
                const addToCart = new Cart({
                    userId:existingUser._id,
                    subTotal:existingProduct.salePrice,
                    items: [{
                        productId:existingProduct._id,
                        price:existingProduct.salePrice,
                        totalPrice:existingProduct.salePrice,
                    }]
                })
                await addToCart.save();
                res.status(200).json({success:true,message:"Product Successfully Added to Cart"})
            } else {
                res.status(201).json({success:false,message:"This Product is Out of Stock"})
            }
        } else if (existingCart && existingProduct && existingUser) {
            const existingsubTotal = existingCart.subTotal
            const newsubTotal = existingsubTotal + existingProduct.salePrice
            if(productQuantity > 0) {
                await Cart.updateOne(
                    {userId:existingUser._id},
                    { subTotal:newsubTotal,
                        $push: { items : {
                        productId:existingProduct._id,
                        price:existingProduct.salePrice,
                        totalPrice:existingProduct.salePrice,
                    }}}
                )
                res.status(200).json({success:true,message:"Product Successfully Added to Cart"})
            } else {
                res.status(201).json({success:false,message:"This Product is Out of Stock"})
            }
        } else {
            res.status(201).json({success:false,message:"Add to Cart Error Occured,Please Try again"})
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({success:false,message:"An error occured. Please try again"});
    }
}

const incrementQuantity = async (req, res) => {
    try {
        const { id } = req.body;
        const cartItem = await Cart.findOne({ "items._id": id });

        if (cartItem) {
            const subTotlal = cartItem.subTotal;
            const item = cartItem.items.find(item => item._id == id);
            const product = await Product.findOne({_id:item.productId})
            const productQuantity = product.quantity
            const newQuantity = item.Quantity + 1;
            const newTotalPrice = item.price * newQuantity;
            const newsubTotal = subTotlal + product.salePrice
            
            if (newQuantity <= 10 && productQuantity >= newQuantity) {
                await Cart.updateOne(
                    { "items._id": id },
                    { subTotal : newsubTotal,
                        $set: {
                            "items.$.Quantity": newQuantity,
                            "items.$.totalPrice": newTotalPrice,
                        }
                    }
                );
                res.json({ success: true, newQuantity, newTotalPrice , newsubTotal});
            } else {
                res.json({ success: false, message: "Maximum quantity reached.", maxReached: true });
            }
        } else {
            res.json({ success: false, message: "Item not found." });
        }
    } catch (error) {
        console.error("Error incrementing quantity:", error);
        res.status(500).json({ success: false, message: "Could not increment quantity." });
    }
}

const decrementQuantity = async (req, res) => {
    try {
        const { id } = req.body;
        const cartItem = await Cart.findOne({ "items._id": id });

        if (cartItem) {
            const subTotlal = cartItem.subTotal;
            const item = cartItem.items.find(item => item._id == id);
            const product = await Product.findOne({_id:item.productId})
            const productQuantity = product.quantity
            const newQuantity = item.Quantity - 1;
            const newTotalPrice = item.price * newQuantity;
            const newsubTotal = subTotlal - product.salePrice

            if (newQuantity >= 1 && productQuantity >= newQuantity) {
                await Cart.updateOne(
                    { "items._id": id },
                    {   subTotal: newsubTotal,
                        $set: {
                            "items.$.Quantity": newQuantity,
                            "items.$.totalPrice": newTotalPrice
                        }
                    }
                );
                res.json({ success: true, newQuantity, newTotalPrice ,newsubTotal});
            } else {
                res.json({ success: false, message: "Minimum quantity reached.", minReached: true });
            }
        } else {
            res.json({ success: false, message: "Item not found." });
        }
    } catch (error) {
        console.error("Error decrementing quantity:", error);
        res.status(500).json({ success: false, message: "Could not decrement quantity." });
    }
}



//remove-cart
const removeCart = async (req,res) => {
    try {
        const id = req.body.id;

        const cartItem = await Cart.findOne({ "items._id": id });
        const subTotal = cartItem.subTotal
        const item = cartItem.items.find(item => item._id == id)
        const totalPrice = item.totalPrice
        const newsubTotal = subTotal - totalPrice

        if(cartItem) {
            await Cart.updateOne(
                { "items._id": id },
                { subTotal: newsubTotal,
                    $pull:{items:{_id:id}}}
            )
            res.status(200).json({ success: true, message: "Product removed from Cart"});
        } else {
            res.status(200).json({success: false , message: "Product remove an error accured"})
        }

        
    } catch (error) {
        console.error(error);
        res.status(500).json({success:false,message:"An error occured. Please try again"});
    }
}


module.exports = {
    loadCartPage,
    addToCart,
    removeCart,
    decrementQuantity,
    incrementQuantity,
}