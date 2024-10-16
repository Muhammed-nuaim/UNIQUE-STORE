const User = require ("../../models/userModel");
const nodemailer = require ("nodemailer");
const bcrypt = require ('bcrypt')
const env = require ("dotenv").config();
const session = require ("express-session");


function generateOtp() {
    const digits = "1234567890";
    let otp=""
    for(let i=0;i<6;i++) {
        otp+=digits[Math.floor(Math.random()*10)];
    }
    return otp;
}

const resendOtp = async (req, res) => {
    try {
        console.log(req.session.email)
        const  email  = await req.session.email;
        console.log(email)
        if (!email) {
            return res.status(400).json({ success: false, message: "Email not found in session" });
        }

        const otp = generateOtp();
        req.session.userOtp = otp;

        const emailSent = await sendVerificationEmail(email, otp);
        if (emailSent) {
            console.log("Resend OTP:", otp);
            res.status(200).json({ success: true, message: "OTP Resent Successfully" });
        } else {
            res.status(500).json({ success: false, message: "Failed to resend OTP, Please try again" });
        }
    } catch (error) {
        console.log("Error resending OTP", error);
        res.status(500).json({ success: false, message: "Internal Server Error, Please try again" });
    }
};

const sendVerificationEmail = async (email,otp) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: process.env.NODEMAILER_EMAIL,
                pass: process.env.NODEMAILER_PASSWORD
            }
        });

        const mailOptions = {
            from: process.env.NODEMAILER_EMAIL,
            to: email,
            subject: "Your OTP for password reser",
            text: `Your OTP is ${otp}`,
            html: `<b><h4>Your OTP: ${otp}</h4><br></b>`
        }

        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent:",info.messageId);
        return true;

    } catch (error) {
        console.error("Error sending email", error);
        return false;
    }
}

const securePassword = async (password) => {
    try {
        return await bcrypt.hash(password, 10);
    } catch (error) {
        console.error("Error securing password", error);
    }
};

const getForgotPassPage = async (req,res) => {
    try {
        res.render("forgotPassword");
    } catch (error) {
        res.redirect("/user/pageNotFound")
    }
}


const forgotEmailValid = async (req,res) => {
    try {
        const {email} = req.body;
        const findUser = await User.findOne({email:email});
        if(findUser) {
            const otp = generateOtp();
            const emailSent = await sendVerificationEmail(email,otp);
            if(emailSent) {
                req.session.userOtp = otp;
                req.session.email = email;
                res.render("forgot-password-otp");
                console.log("OTP:",otp,email);
            } else {
                res.json({success:false, message:"Failed to send OTP, please try again"});
            }
        } else {
            res.render("forgotPassword",{
                message:"User with THis email does not exist"
            })
        }
    } catch (error) {
        res.redirect("user/pageNotFound")
    }
}

const verifyForgotPassOtp = async (req,res) => {
    try {
        const enteredOtp = req.body.otp;
        console.log(enteredOtp,req.session.userOtp);
        
        if(enteredOtp === req.session.userOtp) {
            
            res.json({success:true,redirectUrl:"/reset-password"});
        } else {
            res.json({success:false,message:"OTP not matching"});
        }
    } catch (error) {
        res.status(500).json({success:false,message:"An error occured. Please try again"});
    }
}


const getResetPassPage = async (req,res) => {
    try {
        res.render("reset-password");
    } catch (error) {
        res.redirect("/user/pageNotFound");
    }
}

const newPassword = async (req,res) => {
    try {
        const newPassword =  req.body.newPass1;
        const confirmPassword = req.body.newPass2;
        const email = req.session.email;
        
        if(newPassword === confirmPassword) {
            
            
            const passwordHash = await securePassword(newPassword);
            
            
            await User.updateOne(
                {email:email},
                {$set:{password:passwordHash}}
            )
            
            res.redirect("/login")
        } else {
            res.render("reset-password",{message:'password do not match'})
        }
    } catch (error) {
        res.redirect("/user/pageNotFound")
    }
}

module.exports = {
    getForgotPassPage,
    forgotEmailValid,
    verifyForgotPassOtp,
    resendOtp,
    getResetPassPage,
    newPassword
}