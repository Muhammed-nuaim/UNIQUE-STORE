const Product = require("../../models/productModel");
const Category = require("../../models/CategoryModel");
const User = require('../../models/userModel');
const Order = require('../../models/orderModel')
const ProductOffer = require("../../models/productOfferModel");
const CategoryOffer = require("../../models/categoryOfferModel")

const getProductOffer = async(req,res) => {
    try {
        const existingProducts = await Product.find({isBlocked:false});
        const productOffer = await ProductOffer.find({}).populate("productId")

        if(productOffer) {
            res.render("product-offer",{existingProducts,productOffer})
        } else {
            res.render("product-offer",{existingProducts})
        }

    } catch (error) {
        res.redirect("/admin/page-error")
    }
}

const getCategoryOffer = async(req,res) => {
    try {
        const existingCategory = await Category.find({isListed:true});
        const categoryOffer = await CategoryOffer.find({}).populate("categoryId")

        if(categoryOffer) {
            res.render("category-offer",{existingCategory,categoryOffer})
        } else {
            res.render("category-offer",{existingCategory})
        }

    } catch (error) {
        res.redirect("/admin/page-error")
    }
}

const addProductOffer = async (req,res) => {
    try {        
        const {name,value,date,offerType,selectedProductId} = req.body
        const existingProduct = await Product.findOne({_id:selectedProductId})
        let offerPrice = 0;

        if(offerType == "Percentage") {
        console.log("ji");

            offerPrice = existingProduct.regularPrice - (existingProduct.regularPrice * (value/100))
        console.log("hi");

        } else {
            offerPrice = existingProduct.regularPrice - value
        }


        console.log(existingProduct.regularPrice,offerPrice);

        if(existingProduct && offerPrice){
            const newOfferUpdated = new ProductOffer({
                offerName:name,
                offerPrice:offerPrice,
                expireOn:date,
                productId:selectedProductId,
            })
            await newOfferUpdated.save()
            if(newOfferUpdated) {
                await Product.updateOne({
                    _id:selectedProductId,isBlocked:false
                },{salePrice:newOfferUpdated.offerPrice})
            }
            res.status(200).json({success:true})
        } else {
            res.status(201).json({success:false})
        }
        
        
    } catch (error) {
        console.error(error);
    }
}


const deleteProductOffer = async (req,res) => {
    try {
        const id = req.body.id        
        const existingProductOffer = await ProductOffer.findOne({_id:id})
        console.log("a");
        let newPrice = 0;
        

        if(existingProductOffer) {
            const existingProduct = await Product.findOne({_id:existingProductOffer.productId})
        console.log("b");

            if(existingProduct) {
        console.log("c");
                newPrice = existingProduct.regularPrice - (existingProduct.regularPrice * (5/100))
                await Product.updateOne(
                    {_id:existingProduct._id},
                    {salePrice:newPrice}
                )
                await ProductOffer.deleteOne(
                    {_id:id}
                )
                res.status(200).json({success:true,message:"ProductOffer removed Succesfully"})
            } else {
            res.status(201).json({success:false,message:"This product is not Found,Please try again"})
            }
        } else {
            res.status(201).json({success:false,message:"This productOffer is not Found,Please try again"})
        }
    } catch (error) {
        res.status(500)
        console.error(error)
    }
}


const addCategoryOffer = async (req,res) => {
    try {        
        const {name,value,date,offerType,selectedCategoryId} = req.body
        const existingProduct = await Product.find({category:selectedCategoryId})
        let offerPrice = 0;
        console.log(existingProduct);
        
        if(offerType == "Percentage") {
            for(let item of existingProduct ) {
            offerPrice = item.regularPrice - (item.regularPrice * (value/100))
            if(existingProduct && offerPrice){
                const newOfferUpdated = new CategoryOffer({
                    offerName:name,
                    offerPrice:value,
                    expireOn:date,
                    categoryId:selectedCategoryId,
                })
                await newOfferUpdated.save()
                if(newOfferUpdated) {
                    await Product.updateOne({
                        category:selectedCategoryId,isBlocked:false
                    },{salePrice:offerPrice})
                }
                res.status(200).json({success:true})
            } else {
                res.status(201).json({success:false})
            }
            }
        }
        
        
    } catch (error) {
        console.error(error);
    }
}
 

const deleteCategoryOffer = async (req,res) => {
    try {
        const id = req.body.id        
        const existingCategoryOffer = await CategoryOffer.findOne({_id:id})
        let newPrice = 0;
        

        if(existingCategoryOffer) {
            const existingProduct = await Product.find({category:existingCategoryOffer.categoryId})
            if(existingProduct) {
            for(let item of existingProduct ) {
                newPrice = item.regularPrice - (item.regularPrice * (5/100))
                await Product.updateOne(
                    {_id:item._id},
                    {salePrice:newPrice}
                )
                await CategoryOffer.deleteOne(
                    {_id:id}
                )
                res.status(200).json({success:true,message:"CategoryOffer removed Succesfully"})
            }
            } else {
            res.status(201).json({success:false,message:"This category is not Found,Please try again"})
            }
        } else {
            res.status(201).json({success:false,message:"This CategoryOffer is not Found,Please try again"})
        }
    } catch (error) {
        res.status(500)
        console.error(error)
    }
}

module.exports = {
    getProductOffer,
    getCategoryOffer,
    addProductOffer,
    deleteProductOffer,
    addCategoryOffer,
    deleteCategoryOffer
}