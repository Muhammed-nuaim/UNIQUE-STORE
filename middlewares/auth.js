const User = require("../models/userModel")


const userAuth = (req,res,next) => {
    if(req.session.user){
        User.findById(req.session.user)
        .then (data => {
            if (data && !data.isBlocked) {
                next()
            } else {
                res.redirect("/login")
            }
        })
        .catch(error => {
            console.log("Error in user authentication middlewate",error);
            res.status(500).send("Inter Server error")
        })
    } else {
        res.redirect("/login")
    }
}

const adminAuth = async (req,res,next) => {
   try {
    if(req.session.admin){
        const admin= await User.findOne({isAdmin:true});
        if(admin) {
            next()
        } else {
         res.redirect("/admin/login")
        }
    } else {
        res.redirect("/admin/login")
    }

   } catch (error) {
    
   }
}

module.exports = {
    userAuth,
    adminAuth
}