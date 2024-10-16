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

const getAllProducts = async(req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 4;
        const skip = (page - 1) * limit;

        // If there's a search query, include it in the find conditions
        const searchQuery = req.query.search || '';
        const findConditions = searchQuery 
            ? { productName: { $regex: searchQuery, $options: 'i' } }
            : {};

        const productData = await Product.find(findConditions)
            .sort({createdAt: -1})
            .skip(skip)
            .limit(limit)
            .populate('category')  // Make sure 'category' matches your schema reference name
            .exec();

        const totalProducts = await Product.countDocuments(findConditions);
        const totalPages = Math.ceil(totalProducts / limit);

        const category = await Category.find({isListed: true});

        // Ensure current page doesn't exceed total pages
        const validatedPage = Math.min(page, totalPages);
        
        // Calculate page range
        let startPage = Math.max(1, validatedPage - 1);
        let endPage = Math.min(totalPages, validatedPage + 1);

        // Ensure we show at least 3 pages if available
        if (endPage - startPage + 1 < 3) {
            if (startPage === 1) {
                endPage = Math.min(3, totalPages);
            } else if (endPage === totalPages) {
                startPage = Math.max(1, totalPages - 2);
            }
        }

        res.render("products", {
            data: productData,
            currentPage: validatedPage,
            totalPages: totalPages,
            totalProducts: totalProducts,
            cat: category,
            startPage: startPage,
            endPage: endPage,
            searchQuery: searchQuery
        });

    } catch (error) {
        console.error('Error in getAllProducts:', error);
        res.redirect("/admin/page-error");
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

const getEditProduct = async (req, res) => {
    try {
        const id = req.query.id;
        const product = await Product.findOne({_id: id});
        const existingCategory = await Category.findOne({_id: product.category, isListed: true});
        const category = await Category.find({isListed: true});

        // Ensure product.productImage is always an array of length 4
        const normalizedImages = [...(product.productImage || [])];
        while (normalizedImages.length < 4) {
            normalizedImages.push(null);
        }
        product.productImage = normalizedImages;

        res.render("edit-product", {
            product: product,
            pcat: existingCategory,
            cat: category
        });
        
    } catch (error) {
        console.error("Error in getEditProduct:", error);
        res.redirect("/admin/page-error");
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
        const category = await Category.findOne({name: data.category,isListed:true})
        const newImages = req.files.map(file => file.filename);  

        // Update basic fields
        const updateFields = {
            productName: data.productName,
            category: category._id,
            description: data.description,
            regularPrice: data.regularPrice,
            salePrice: data.salePrice,
            quantity: data.quantity,
            color: data.color,
        };

        // Handle image updates
        if (newImages.length > 0) {
            // Get current images
            let currentImages = [...product.productImage];
            
            // Add new images while maintaining the maximum of 4 images
            newImages.forEach((newImage, index) => {
                if (index < 4) {
                    if (currentImages[index]) {
                        // Delete old image file if it exists
                        const oldImagePath = path.join("public", "uploads", "re-image", currentImages[index]);
                        if (fs.existsSync(oldImagePath)) {
                            fs.unlinkSync(oldImagePath);
                        }
                        // Replace old image with new one
                        currentImages[index] = newImage;
                    } else {
                        // Add new image if slot is empty
                        currentImages.push(newImage);
                    }
                }
            });

            // Ensure we don't exceed 4 images
            currentImages = currentImages.slice(0, 4);
            updateFields.productImage = currentImages;
        }

        // Update the product
        await Product.findByIdAndUpdate(id, updateFields, { new: true });
        
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
