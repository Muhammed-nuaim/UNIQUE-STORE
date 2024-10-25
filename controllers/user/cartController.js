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
        const existingCart = await Cart.findOne({userId:existingUser._id})
        const cartProductData = await Product.find({_id:{$in:existingCart.items.map(id => id.productId)}})
        
        if(existingUser && !existingCart) {
            res.render('cartPage',{user})
        } else if (existingCart && existingUser) {
            res.render('cartPage',{user , cartData:existingCart.items , productData:cartProductData})
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
        const existingCart = await Cart.findOne({userId:existingUser._id})
        const alreadyCart = await Cart.findOne({userId:existingUser._id,"items.productId":existingProduct._id})


        if(alreadyCart) {
            res.status(201).json({success:false,message:"Product is already in the cart"})
        }
        else if(existingProduct && existingUser && !existingCart) {
            const addToCart = new Cart({
                userId:existingUser._id,
                items: [{
                    productId:existingProduct._id,
                    price:existingProduct.salePrice,
                    totalPrice:existingProduct.salePrice
                }]
            })
            await addToCart.save();
            res.status(200).json({success:true,message:"Product Successfully Added to Cart"})
        } else if (existingCart && existingProduct && existingUser) {
            await Cart.updateOne(
                {userId:existingUser._id},
                {$push: { items : {
                    productId:existingProduct._id,
                    price:existingProduct.salePrice,
                    totalPrice:existingProduct.salePrice
                }}}
            )
            res.status(200).json({success:true,message:"Product Successfully Added to Cart"})
        } else {
            res.status(201).json({success:false,message:"Add to Cart Error Occured,Please Try again"})
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({success:false,message:"An error occured. Please try again"});
    }
}


//remove-cart
const removeCart = async (req,res) => {
    try {
        
    } catch (error) {
        console.error(error);
        res.status(500).json({success:false,message:"An error occured. Please try again"});
    }
}


module.exports = {
    loadCartPage,
    addToCart,
    removeCart
}