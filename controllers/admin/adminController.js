const User = require("../../models/userModel")
const mongoose =require("mongoose");
const bcrypt = require("bcrypt");


const pageerror = async(req,res) => {
    try {
        res.render("page-error-404")
    } catch (error) {
        console.log(error);
        
    }
}


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
        return res.redirect("/page-error")
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

const logout = async (req,res) => {
    try {
        req.session.destroy(err => {
            if(err) {
                console.log("Error destoying session",err)
                return res.redirect ("/page-error")
            }
            res.redirect("/admin/login")
        })
    } catch (error) {
        console.log("unexpected error during logout",error)
        res.redirect("/page-error")
    }
}
    


module.exports = {
    pageerror,
    loadLogin,
    login,
    loadDashboard,
    logout
}