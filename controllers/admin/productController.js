const Product = require("../../models/productModel");
const Category = require("../../models/CategoryModel");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { log } = require("console");

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
            if(categoryId){
                const newProduct = new Product({
                    productName: productName,
                    description: description,
                    category:categoryId._id,
                    regularPrice: regularPrice,
                    salePrice: salePrice,
                    createdOn: new Date(),
                    quantity: quantity,
                    color: color,
                    productImage: images,
                    status: 'Available', // Fixed typo here
                });
                await newProduct.save();

            return res.redirect("/admin/addProducts");
            } else {
                const newProduct = new Product({
                    productName: productName,
                    description: description,
                    regularPrice: regularPrice,
                    salePrice: salePrice,
                    createdOn: new Date(),
                    quantity: quantity,
                    color: color,
                    productImage: images,
                    status: 'Available', // Fixed typo here
                });
                await newProduct.save();

            return res.redirect("/admin/addProducts");
            }
            
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

const getEditProduct = async (req,res) => {
    try {
        const id= req.query.id;
        const product =await Product.findOne({_id:id});
        const existingCategory = await Category.findOne({_id:product.category,isListed:true});
        const category = await Category.find({isListed:true});
        // console.log(productCategory.name);
        res.render("edit-product",{
            product:product,
            pcat:existingCategory,
            cat:category
        })
        
    } catch (error) {
        res.redirect("/admin/page-error")
    }
}

const editProduct = async (req, res) => {
    try {
        const id = req.params.id;
        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({ error: "Product not found." });
        }

        const data = req.body;
        const newImages = req.files.map(file => file.filename); // Array of new uploaded image filenames

        // Update fields
        const updateFields = {
            productName: data.productName,
            description: data.description,
            regularPrice: data.regularPrice,
            salePrice: data.salePrice,
            quantity: data.quantity,
            color: data.color,
        };

        // Update images if new ones are uploaded (we handle max 4 images)
        for (let i = 0; i < 4; i++) {
            if (newImages[i]) {
                product.productImage[i] = newImages[i]; // Replace the image at index i
            }
        }

        await Product.findByIdAndUpdate(id, updateFields, { new: true });
        await product.save(); // Save the updated product with new images

        res.redirect("/admin/products");

    } catch (error) {
        console.error("Error updating product:", error.message);
        res.redirect("/admin/page-error");
    }
};




const deleteSingleImage = async (req, res) => {
    try {
        const { imageNameToServer, productIdServer } = req.body;

        // Update the product by removing the image from the array
        await Product.findByIdAndUpdate(productIdServer, {
            $pull: { productImage: imageNameToServer }
        });

        // Path to the image to be deleted
        const imagePath = path.join("public", "uploads", "re-image", imageNameToServer);
        
        // Check if the image exists and then delete it
        if (fs.existsSync(imagePath)) {
            await fs.unlinkSync(imagePath);
            console.log(`Image ${imageNameToServer} deleted successfully.`);
        } else {
            console.log(`Image ${imageNameToServer} not found.`);
        }

        res.send({ status: true });

    } catch (error) {
        console.error("Error deleting image:", error.message);
        res.redirect("/admin/page-error");
    }
};



module.exports = {
    getProductAddPage,
    addProducts,
    getAllProducts,
    blockProduct,
    unblockProduct,
    getEditProduct,
    editProduct,
    deleteSingleImage
};
