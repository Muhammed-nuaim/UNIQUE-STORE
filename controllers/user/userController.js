const User = require("../../models/userModel");

const pageNotFound = async(req,res) => {
    try {
        res.render("page-404")
    } catch (error) {
        res.redirect('/pageNotFound')
    }
}

const loadHomePage = async( req,res ) => {
    try {
        res.render("User/index")
    } catch (error) {
        console.log("Home page is not found");
        res.status(500).send("Server error")
    }
}

const loadSignup = async(req,res) =>{
    try {
        return res.render("User/sign-up")
    } catch (error) {
        console.log("Sign Up page is not found");
        res.status(500).send("Server error")
    }
}

const signup = async(req,res) =>{
    const {name,email,password} = req.body
    try {
        const newUser = await User.create({name,email,password})
        console.log(newUser);
        res.redirect('/signup')
    } catch (error) {
        console.error("Error for save user",error);
        res.status(500).send("Server error")
    }
}

const loadlogin = async(req,res) =>{
    try {
        return res.render("User/login")
    } catch (error) {
        console.log("Login page is not found");
        res.status(500).send("Server error")
    }
}



module.exports={
    pageNotFound,
    loadHomePage,
    loadSignup,
    signup,
    loadlogin
}