const User = require("../../models/userModel");
const env = require("dotenv").config()
const nodeMailer = require("nodemailer")
const bcrypt = require("bcrypt")

const pageNotFound = async(req,res) => {
    try {
        res.render("page-404")
    } catch (error) {
        res.redirect('/pageNotFound')
    }
}

const loadHomePage = async( req,res ) => {
    try {
        const user = await req.session.user
        if(user) {
            console.log(user);
            
            const userData = await User.findOne({_id:user})
            res.render("home",{user:userData})
        } else {
            return res.render('home')
        }

    } catch (error) {
        console.log("Home page is not found");
        res.status(500).send("Server error")
    }
}

const loadSignup = async(req,res) =>{
    try {
        return res.render("sign-up")
    } catch (error) {
        console.log("Sign Up page is not found");
        res.status(500).send("Server error")
    }
}

function generateOtp() {
    return Math.floor(100000 + Math.random()*900000).toString();
}

async function sendVerificationEmail (email,otp) {
    try {
        
        const transporter = nodeMailer.createTransport ({
            service: 'gmail',
            port: 587,
            secure: false,
            requireTLS: true,
            auth:{
                user:process.env.NODEMAILER_EMAIL,
                pass:process.env.NODEMAILER_PASSWORD
            }
        })

        const info = await transporter.sendMail({
            from:process.env.NODEMAILER_EMAIL,
            to: email,
            subject: "Verify your account",
            text: `Your Otp is ${otp}`,
            html:`<b>Your Otp: ${otp}</b>`
        })

        return info.accepted.length > 0
    } catch (error) {
        console.error("Error sending email",error);
        return false
    }
}

const signup = async(req,res) =>{
    try {

        const {name,email,password,cpassword} = req.body;
        
        if(password !== cpassword){
            return res.render("sign-up",{message:"Password do not match"})
        }

        const findUser = await User.findOne({email});

        if (findUser) {
            return res.render('sign-up',{message:"This email is already exist"})
        }

        const otp = generateOtp();

        const emailSent = await sendVerificationEmail (email,otp);

        if(!emailSent) {
            return res.json("email-error")
        }

        req.session.userOtp = otp;
        req.session.userData = {name,email,password};

        res.render ("otp");
        console.log("Otp Sent",otp);
        

    } catch (error) {
        console.error("Error for signup",error);
        res.redirect("/pageNotFound")
    }
}

const loadLogin = async(req,res) =>{
    try {
        if(!req.session.user) {
            return res.render("login")
        } else {
            res.redirect('/')
        }
    } catch (error) {
        res.redirect('/pageNOtFound')
    }
}

const login = async(req,res) => {
    try {
        
        const {email,password} = req.body;

        const findUser = await User.findOne({isAdmin:0,email:email})

        if(!findUser) {
            return res.render('login',{message:"User not found"})
        }
        if(findUser.isBlocked) {
            return res.render('login',{message:"User is blocked by admin"})
        }

        const passwordMatch = await bcrypt.compare(password,findUser.password)

        if(!passwordMatch) {
            return res.render('login',{message:"Incorrect Password"})
        }

        req.session.user = findUser._id;
        res.redirect('/')

    } catch (error) {
        console.error("login error",error)

        res.render('login',{message:"Login Failed, Please try again later"})
    }
}

const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password,10)
        return passwordHash;
    } catch (error) {
        
    }
}
const verifyOtp = async (req,res) =>{
    try {
        const {otp} = req.body

        if(otp === req.session.userOtp){
            const user = await req.session.userData
            const passwordHash = await securePassword(user.password);

            const saveUserData = new User({
                name:user.name,
                email:user.email,
                password:passwordHash
            })
            await saveUserData.save()
            req.session.user = saveUserData._id
            res.json({success:true,redirectUrl:"/"})
        } else {
            res.status(400).json({success:false, message: "Invalid OTP, Please try again"})
        }
    } catch (error) {
        console.error("Error Verifying Otp",error);
        res.status(500).json({success:false,message:"An error occured"})
    }
}

const resendOtp = async (req,res) => {
    try {
        const {email} = req.session.userData;
        if(!email){
            return res.status(400).json({success:false,message:"Email not found in session"})
        }

        const otp = generateOtp()
        req.session.userOtp = otp;

        const emailSent = await sendVerificationEmail(email,otp)
        if(emailSent) {
            console.log("Resend OTP:",otp);
            res.status(200).json({success:false,message:"OTP Resend Successfully"})
        } else {
            res.status(500).json({success:false,message:"Failed to resend OTP, Please try again"})
        }
    } catch (error) {
        console.log("Error resending OTP",error);
        res.status(500).json({success:false,message:"Internal Server Error, Please try again"})
    }
}

const logout = async(req,res) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                console.log("Session destruction error",err.message);
                return res.redirect("/pageNotFound")
            } 
            return res.redirect('/login')
        })

    } catch (error) {
        console.log("Logout error",error)
        res.redirect("/pageNotFound")
    }
}

module.exports={
    pageNotFound,
    loadHomePage,
    loadSignup,
    signup,
    loadLogin,
    login,
    verifyOtp,
    resendOtp,
    logout
}