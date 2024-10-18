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
    console.log(size);
    
    if(product) {
        res.render("product-detail",{ user , product , category , size})
    } else {
        res.render("page-404")
    }
    
    } catch (error) {
        res.render("page-404")
    }
}

const shoppingPage = async (req,res) => {
    try {
        const user = req.session.user;
        const Categories = await Category.find({isListed:true});
        let productData = await Product.find(
            {isBlocked:false,
            category:{$in:Categories.map(category => category._id)}
            })
            
            productData.sort((a,b) => new Date(b.createdOn)-new Date(a.createdOn))
            productData = productData.slice(0,16)

            if (user) {
                res.render("product", { user , products: productData });
            } else {
                return res.render("product",{products:productData});
            }

    } catch (error) {
        console.log("shopping page is not found", error);
        res.status(500).send("Server error");
    }
}

module.exports = {
    getProductDetais,
    shoppingPage
}