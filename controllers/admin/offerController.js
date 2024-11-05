const Product = require("../../models/productModel");
const Category = require("../../models/CategoryModel");
const User = require('../../models/userModel');
const Order = require('../../models/orderModel')
const ProductOffer = require("../../models/productOfferModel");

const getProductOffer = async(req,res) => {
    try {
        const existingProducts = await Product.find({isBlocked:false});
        const productOffer = await ProductOffer.find({})

        if(productOffer) {
            res.render("product-offer",{existingProducts,productOffer})
        } else {
            res.render("product-offer",{existingProducts})
        }

    } catch (error) {
        res.redirect("/admin/page-error")
    }
}

const getCategoryOffer = async (req,res) => {
    try {
        res.render("category-offer")
    } catch (error) {
        res.redirect("/admin/page-error")
    }
}

const addProductOffer = async (req,res) => {
    try {
        const {name,value,date,offerType,selectedProductId} = req.body
        const existingProduct = await Product.findOne({_id:selectedProductId})
        const offerPrice = existingProduct.regularPrice - value
        console.log(existingProduct.regularPrice,offerPrice);
        // if(existingProduct && offerPrice){
        //     const newOfferUpdated = new ProductOffer({
        //         name:name,
        //         value:value,
        //         date:date,
        //         offerType:offerType,
        //         productId:selectedProductId,
        //     })
        //     await newOfferUpdated.save()
        //     if(newOfferUpdated) {
        //         await Product.updateOne({
        //             _id:selectedProductId,isBlocked:false
        //         },{salePrice:offerPrice})
        //     }
        // }
        // console.log(offerPrice);
        
        
    } catch (error) {
        res.redirect("/admin/page-error")
    }
}
 

module.exports = {
    getProductOffer,
    getCategoryOffer,
    addProductOffer
}