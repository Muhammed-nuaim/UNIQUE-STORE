const User = require("../../models/userModel");
const Product = require("../../models/productModel");
const Category = require("../../models/CategoryModel");
const Address = require("../../models/addressModel");
const Cart =require("../../models/cartModel");
const Order = require("../../models/orderModel")
const Coupon = require("../../models/couponModel");


//payment integration
const paypal = require('paypal-rest-sdk');
paypal.configure({
  'mode': process.env.PAYPAL_MODE, //sandbox or live
  'client_id': process.env.PAYPAL_CLIENT_ID,
  'client_secret': process.env.PAYPAL_SECRET_ID
});

const getPayPal = async(req,res) => {
    try {
            const {subTotal,paymentMethod} = req.body;
            console.log("Subtotal received:", subTotal);
            
            const create_payment_json = {
              "intent": "sale",
              "payer": {
                  "payment_method": paymentMethod
              },
              "redirect_urls": {
                  "return_url": "/successPayPal",
                  "cancel_url": "/cancelPayPal"
              },
              "transactions": [{
                  "item_list": {
                      "items": [{
                          "name": "Red Sox Hat",
                          "sku": "001",
                          "price": subTotal,
                          "currency": "USD",
                          "quantity": 1
                      }]
                  },
                  "amount": {
                      "currency": "USD",
                      "total": subTotal
                  },
                  "description": "Hat for the best team ever"
              }]
          };
        
          paypal.payment.create(create_payment_json, function (error, payment) {
            if (error) {
                console.error("PayPal error:", error);
                res.status(500).json({ success: false, message: "PayPal payment creation failed." });
            } else {
                const approvalUrl = payment.links.find(link => link.rel === 'approval_url');
                if (approvalUrl) {
                    res.json({ success: true, approval_url: approvalUrl.href });
                } else {
                    res.status(500).json({ success: false, message: "Approval URL not found." });
                }
            }
        });
    } catch (error) {
        
    }
}


const successPayPal = async (req,res) => {
    try {
            const payerId = req.query.PayerID;
            const paymentId = req.query.paymentId;
          
            const execute_payment_json = {
              "payer_id": payerId,
              "transactions": [{
                  "amount": {
                      "currency": "USD",
                      "total": subTotal
                  }
              }]
            };
          
            paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
              if (error) {
                  console.log(error.response);
                  throw error;
              } else {
                  res.redirect('/order-success');
              }
          });
    } catch (error) {
        
    }
}

const cancelPayPal = async(req,res) => {
    try {
            res.send('Cancelled');
    } catch (error) {
        
    }
}


module.exports = {
    getPayPal,
    successPayPal,
    cancelPayPal
}