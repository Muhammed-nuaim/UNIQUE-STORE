const User = require ("../../models/userModel")
const Product = require ("../../models/productModel")
const Category = require ("../../models/CategoryModel")
const Whishlist = require ("../../models/whishlistModel")


const addWhishlist = async (req,res) => {
    try {
        const id = req.body.id
        const user = req.session.user;
        
        
        const existingUser = await User.findOne({_id:user.id,isBlocked:false})
        
        const existingProduct = await Product.findById({_id:id})
        
        if(existingProduct && existingUser) {
            const newWhishlist =  new Whishlist ({
                userId: existingUser._id,
                productId:existingProduct._id
            })
            await newWhishlist.save()
            console.log(newWhishlist);
            
            res.status(200).json({ success: true});
        }
        else {
            res.status(400).json({ success: false});
        }

        } catch (error) {
            res.status(500).json({ success: false, message: 'Server error' });
    }
}

const loadWhishlist = async (req,res) => {
    try {
        const user = req.session.user
        const existingUser = await User.findOne({_id:user.id,isBlocked:false})
        const existingWhishlist = await Whishlist.find({userId:existingUser._id})
        const whishlistData = await Product.find({_id:{$in:existingWhishlist.map(hi => hi.productId)}})
        
        
        if(existingUser && existingWhishlist) {
            return res.render('whishlist',{user , product:whishlistData})
        }
        else if(existingUser) {
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