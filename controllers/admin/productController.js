const Product = require("../../models/productModel");
const Category = require("../../models/CategoryModel");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

// Load the page to add products
const getProductAddPage = async (req, res) => {
    try {
        const category = await Category.find({ isListed: true }); // Only show listed categories
        res.render("product-add", {
            cat: category,
        });
    } catch (error) {
        console.error("Error loading add product page", error);
        res.redirect("/admin/page-error");
    }
};

// Add a new product
const addProducts = async (req, res) => {
    try {
        const {productName,description,regularPrice,salePrice,quantity,color,category}= req.body;

        // Check if the product already exists
        const productExists = await Product.findOne({
            productName: productName,
        });


        if (!productExists) {
            const images = [];

            // Handle image uploads and resizing
            if (req.files && req.files.length > 0) {
                for (let i = 0; i < req.files.length; i++) {
                    const originalImagePath = req.files[i].path;

                    // Resized image destination path
                    const resizedImagePath = path.join('public', 'uploads', 'product-images', req.files[i].filename);

                    // Resize the image using Sharp and save
                    await sharp(originalImagePath).resize({ width: 404, height: 440 }).toFile(resizedImagePath);
                    images.push(req.files[i].filename);
                }
            }

            // Validate category
            const categoryId = await Category.findOne({ name: category });
            if (!categoryId) {
                return res.status(400).json({ error: "Invalid category name" });
            }

            // Create new product without "brand"
            const newProduct = new Product({
                productName: productName,
                description: description,
                category: categoryId._id,
                regularPrice: regularPrice,
                salePrice: salePrice,
                createdOn: new Date(),
                quantity: quantity,
                color: color,
                productImage: images,
                status: 'Available', // Fixed typo here
            });

            // Save the product to the database
            await newProduct.save();

            return res.redirect("/admin/addProducts");
        } else {
            return res.status(400).json({ error: "Product already exists, please try with another name" });
        }
    } catch (error) {
        console.error("Error saving product", error);
        return res.redirect("/admin/page-error");
    }
};

const getAllProducts = async(req,res) =>{
    try {
        const search = req.query.search || "";
        const page = req.query.page || 1;
        const limit = 4;

        const productData = await Product.find({
            $or:[

                {productName:{$regex:new RegExp(".*"+search+".*","i")}}
                
            ],
        }).limit(limit*1)
        .skip((page-1)*limit)
        .populate('category')
        .exec();

        const count = await Product.find({
            $or:[
                {productName:{$regex:new RegExp(".*"+search+".*","i")}},
            ],
        }).countDocuments();

        const category = await Category.find({isListed:true});
        if(category){
            res.render("products",{
                data:productData,
                currentPage:page,
                totalPages:Math.ceil(count/limit),
                cat:category,

            })
        } else {
            res.render("/admin/page-error");
        }

    } catch (error) {
        res.redirect("/admin/page-error")
    }
}

const blockProduct = async(req,res) => {
    try {
        let id =req.query.id;
        await Product.updateOne({_id:id},{$set:{isBlocked:true}});
        res.redirect("/admin/products");
    } catch (error) {
        res.redirect("/admin/page-error")
    }
}

const unblockProduct = async (req,res) => {
    try {
        let id = req.query.id;
        await Product.updateOne({_id:id},{$set:{isBlocked:false}});
        res.redirect("/admin/products")
    } catch (error) {
        res.redirect("/admin/page-error")
    }
}

module.exports = {
    getProductAddPage,
    addProducts,
    getAllProducts,
    blockProduct,
    unblockProduct
};
