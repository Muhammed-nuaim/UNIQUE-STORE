const User = require("../../models/userModel")
const mongoose =require("mongoose");
const bcrypt = require("bcrypt")


const loadLogin = async(req,res) => {
    if (req.session.admin) {
        return res.redirect("/admin")
    } else{
        res.render("admin-login")
    }
}

const login = async (req,res) => {
    try {
        const {email,password} = req.body;
        const admin = await User.findOne ({email,isAdmin:true})
        if(admin) {   
            const passwrodMatch =await  bcrypt.compare(password,admin.password)
            if (passwrodMatch) {
                req.session.admin =await  true;
                return res.redirect ("/admin")
            } else {
                return res.redirect("/admin/login")
            }
        } else {
            return res.redirect("/admin/login")
        }
    } catch (error) {
        console.log ("login error".error)
        return res.redirect("page-error")
    }
}

const loadDashboard = async (req,res) => {
    if(req.session.admin) {
        try {
            res.render('dashboard')
        } catch (error) {
            res.redirect("/page-error")
        }
    }
}


module.exports = {
    loadLogin,
    login,
    loadDashboard
}