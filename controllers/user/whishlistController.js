const User = require ("../../models/userModel")
const Product = require ("../../models/productModel")
const Category = require ("../../models/CategoryModel")
const Whishlist = require ("../../models/whishlistModel")


const addWhishlist = async (req, res) => {
    try {
        const id = req.body.id; 
        const user = req.session.user;  
        
        const existingWhishlist = await Whishlist.findOne({ userId: user.id });
        const existingProduct = await Product.findById({ _id: id });
        
        const verifyProduct = existingWhishlist?.productId.includes(existingProduct._id);
        
        if (existingWhishlist) {
            if (verifyProduct) {
                await Whishlist.updateOne(
                    { userId: user.id }, 
                    { $pull: { productId: existingProduct._id } }
                );
                
                res.status(200).json({ success: false, message: "Product removed from wishlist" ,favourite: false});
            } else {
                await Whishlist.updateOne(
                    { userId: user.id }, 
                    { $push: { productId: existingProduct._id } }
                );
                
                res.status(200).json({ success: true, message: "Product added to wishlist" ,favourite: true});
            }
        } else if (existingProduct) {
            const newWhishlist = new Whishlist({
                userId: user.id,
                productId: [existingProduct._id]
            });
            
            await newWhishlist.save();
            res.status(200).json({ success: true, message: "Product added to new wishlist" ,favourite: true});
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const loadWhishlist = async (req,res) => {
    try {
        const user = req.session.user

        const existingWhishlist = await Whishlist.findOne({userId:user.id}) 
        const whishlistData = await Product.find({_id:{$in:existingWhishlist.productId.map(id => id)}})
        
        if(existingWhishlist) {
            return res.render('whishlist',{user , product:whishlistData})
        }
        else {
            res.render('whishlist',{user})
        }

    } catch (error) {
        console.log("shopping page is not found", error);
        res.status(500).send("Server error");
    }
}


module.exports = {
    addWhishlist,
    loadWhishlist
}