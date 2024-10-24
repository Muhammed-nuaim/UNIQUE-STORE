const User = require("../../models/userModel")
const Product = require("../../models/productModel")
const Category = require("../../models/CategoryModel")
const Address = require("../../models/addressModel")

const addAddress = async (req,res) => {
    try {
        const {addressType,name,city,landMark,state,pincode,phone,altPhone} = req.body
        const user = req.session.user

        const existingUser = await User.findOne({_id:user.id});
        const existingAddress = await Address.findOne({userId:existingUser._id})

        if(existingUser && !existingAddress) {
            const addAddress = new Address({
                userId : existingUser._id,
                addresses: [{
                    addressType:addressType,
                    name:name,
                    city:city,
                    landMark:landMark,
                    state:state,
                    pincode:pincode,
                    phone:phone,
                    altPhone:altPhone
                }]
            })

            await addAddress.save()
            res.status(200).json({success:true,message:"Address added successfully"})

        } else if(existingAddress && existingUser){
            await Address.updateOne(
                {userId:existingUser._id},
                { $push: { addresses : {
                    addressType:addressType,
                    name:name,
                    city:city,
                    landMark:landMark,
                    state:state,
                    pincode:pincode,
                    phone:phone,
                    altPhone:altPhone
                } }}
            )
            res.status(200).json({success:true,message:"Address added successfully"})

        } else {
            console.log("ititi");
            
            res.state(200).json({success:false,message:"Add address has some error"})
        }

    } catch (error) {
        console.error(error);
        
        res.status(500).json({success:false,message:"An error occured. Please try again"});
    }
}



module.exports = {
    addAddress,
}