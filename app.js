const express = require("express");
const app = express();
const session = require("express-session")
const path = require("path")
const env = require("dotenv").config();
const db = require("./config/db");
const passport = require("./config/passport")
// const nocache = require('nocache');

db();
app.use(express.static("public"))

app.use((req,res,next) => {
    res.set('cache-control','no-store')
    next();
})

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret:process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie:{
        secure: false,
        httpOnly: true,
        maxAge: 72*60*60*1000
    }
}))

app.use(passport.initialize())
app.use(passport.session())

const userRouter = require("./routes/userRouter");
const adminRouter = require("./routes/adminRouter");

app.set('view engine', 'ejs');  // Set the view engine here
app.set('views',[path.join(__dirname,'views/User'),path.join(__dirname,'views/Admin')]);

app.use('/',userRouter);
app.use('/admin',adminRouter);


// //payment integration
// const paypal = require('paypal-rest-sdk');
// paypal.configure({
//   'mode': process.env.PAYPAL_MODE, //sandbox or live
//   'client_id': process.env.PAYPAL_CLIENT_ID,
//   'client_secret': process.env.PAYPAL_SECRET_ID
// });
// app.get('/', (req, res) => res.sendFile(__dirname + "/index.html"));
// app.post('/pay', (req, res) => {
//     const {subTotal,addressId,paymentMethod} = req.body;
//     console.log("Subtotal received:", subTotal);
    
//     const create_payment_json = {
//       "intent": "sale",
//       "payer": {
//           "payment_method": paymentMethod
//       },
//       "redirect_urls": {
//           "return_url": "http://localhost:3000/success",
//           "cancel_url": "http://localhost:3000/cancel"
//       },
//       "transactions": [{
//           "item_list": {
//               "items": [{
//                   "name": "Red Sox Hat",
//                   "sku": "001",
//                   "price": subTotal,
//                   "currency": "USD",
//                   "quantity": 1
//               }]
//           },
//           "amount": {
//               "currency": "USD",
//               "total": subTotal
//           },
//           "description": "Hat for the best team ever"
//       }]
//   };

//   paypal.payment.create(create_payment_json, function (error, payment) {
//     if (error) {
//         console.error("PayPal error:", error);
//         res.status(500).json({ success: false, message: "PayPal payment creation failed." });
//     } else {
//         const approvalUrl = payment.links.find(link => link.rel === 'approval_url');
//         if (approvalUrl) {
//             res.json({ success: true, approval_url: approvalUrl.href });
//         } else {
//             res.status(500).json({ success: false, message: "Approval URL not found." });
//         }
//     }
// });

//   app.get('/success', (req, res) => {
//     const payerId = req.query.PayerID;
//     const paymentId = req.query.paymentId;
  
//     const execute_payment_json = {
//       "payer_id": payerId,
//       "transactions": [{
//           "amount": {
//               "currency": "USD",
//               "total": subTotal
//           }
//       }]
//     };
  
//     paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
//       if (error) {
//           console.log(error.response);
//           throw error;
//       } else {
//           res.redirect('/order-success');
//       }
//   });
//   }); 
    //   });
//   app.get('/cancel', (req, res) => res.send('Cancelled'));

app.listen(process.env.PORT, () => {
    console.log("http://localhost:3000");
});
module.exports = app;