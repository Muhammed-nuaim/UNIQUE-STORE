const User = require("../../models/userModel")
const Product = require("../../models/productModel")
const Category = require("../../models/CategoryModel")

const getProductDetais = async (req,res) => {
    try {
    const id = req.query.id
    const user = req.session.user;

    const product = await Product.findOne({_id:id})
    const category = await Category.findOne({_id:product.category})
    const size = await Product.find({size:product.size})
    
    if(product) {
        if(user){
            const verifyuser = await User.findOne({_id:user.id,isBlocked:false})
            if(verifyuser){
                res.render("product-detail",{ user , product , category , size})
            }else {
                req.session.user = false
                res.render("product-detail",{ product , category , size})
            }
        } else {
            res.render("product-detail",{ product , category , size})
        }
        
    } else {
        res.render("page-404")
    }
    
    } catch (error) {
        res.render("page-404")
    }
}

const searchProduct = async (req, res) => {
    try {
        const search = req.body.value;
        const searchData = search.trim().replace(/[^a-zA-Z\s]/g, "");
        
        if (!searchData) {
            // If search is empty, return all products
            const allProducts = await Product.find({ isBlocked: false })
                .select('productName productImage regularPrice salePrice size')
                .sort({ createdOn: -1 });
            return res.json({ products: allProducts });
        }

        const products = await Product.find({
            productName: { $regex: new RegExp(searchData, "i") },
            isBlocked: false
        }).select('productName productImage regularPrice salePrice size');

        res.json({ products });
    } catch (error) {
        console.error("Search error:", error);
        res.status(500).json({ 
            error: "Server error",
            message: error.message 
        });
    }
};

const shoppingPage = async (req, res) => {
    try {
        const user = req.session.user;
        const page = parseInt(req.query.page) || 1;
        const limit = 8;
        const skip = (page - 1) * limit;

        const Categories = await Category.find({ isListed: true });
        
        let productData = await Product.find({
            isBlocked: false,
            category: { $in: Categories.map(category => category._id) }
        }).select('productName productImage regularPrice salePrice size createdOn').skip(skip).limit(limit)

        // Default sort by newest
        productData.sort((a, b) => new Date(b.createdOn) - new Date(a.createdOn));
        productData = productData

        const totalProducts = await Product.find({
            isBlocked: false,
            category: { $in: Categories.map(category => category._id) }
        }).select('productName productImage regularPrice salePrice size createdOn').countDocuments();
        const totalPages = Math.ceil(totalProducts / limit);


        if (user) {
            const verifyuser = await User.findOne({ _id: user.id, isBlocked: false });
            if (verifyuser) {
                res.render("product", { user, products: productData,currentPage: page,totalPages:totalPages ,totalProducts:totalProducts });
            } else {
                req.session.user = false;
                res.render("product", { products: productData,currentPage: page,totalPages:totalPages ,totalProducts:totalProducts  });
            }
        } else {
            res.render("product", { products: productData,currentPage: page,totalPages:totalPages ,totalProducts:totalProducts  });
        }
    } catch (error) {
        console.error("Shopping page error:", error);
        res.status(500).send("Server error");
    }
};

module.exports = {
    getProductDetais,
    shoppingPage,
    searchProduct
};