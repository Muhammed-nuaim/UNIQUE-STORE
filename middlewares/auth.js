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

const adminAuth = (req,res,next) => {
    User.findOne ({isAdmin:true})
    .then(data => {
        if(data){
            next()
        } else {
            res.redirect("/admin/login")
        }
    })
    .catch (error => {
        console.log("Error in admin Authentication middlewate",error)
        res.status(500).send("Internal Server Error")
    })
}

module.exports = {
    userAuth,
    adminAuth
}