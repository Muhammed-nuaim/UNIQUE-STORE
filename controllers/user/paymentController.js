const User = require("../../models/userModel");
const Product = require("../../models/productModel");
const Category = require("../../models/CategoryModel");
const Address = require("../../models/addressModel");
const Cart =require("../../models/cartModel");
const Order = require("../../models/orderModel")
const Coupon = require("../../models/couponModel");
const axios = require("axios");

//currencyConverter
const convertCurrency = async (amount) => {
    try {
      const apiKey = process.env.OPEN_EXCHANGE_API_KEY; 
      const fromCurrency = 'INR'
      const toCurrency = 'USD'
  
      const response = await axios.get(`https://openexchangerates.org/api/latest.json?app_id=${apiKey}`);
      
      if (response.data && response.data.rates) {
        const usdToInrRate = response.data.rates[fromCurrency];
        const usdToUsdRate = response.data.rates[toCurrency];
        const convertedAmount = amount * (usdToUsdRate / usdToInrRate);
  
        console.log(convertedAmount);
        
        
        return convertedAmount.toFixed(2);
      } else {
        throw new Error('Unable to retrieve exchange rates.');
      }
  
    } catch (error) {
      console.error('Currency conversion error:', error);
      throw error;
    }
  };  


//payment integration
const paypal = require('paypal-rest-sdk');
paypal.configure({
  'mode': process.env.PAYPAL_MODE, //sandbox or live
  'client_id': process.env.PAYPAL_CLIENT_ID,
  'client_secret': process.env.PAYPAL_SECRET_ID
});

const getPayPal = async(req,res) => {
    try {
        const {subTotal,addressId,paymentMethod} = req.body;
        const USDCurrency = await convertCurrency(subTotal);
        console.log("Converted amount in USD:", USDCurrency);
        
        req.session.order = {
            USDCurrency: USDCurrency,
            subTotal: subTotal,
            addressId: addressId,
            paymentMethod: paymentMethod
        }
        
        const create_payment_json = {
            "intent": "sale",
            "payer": {
                "payment_method": paymentMethod
            },
            "redirect_urls": {
                "return_url": "http://localhost:3000/successPayPal",
                "cancel_url": "http://localhost:3000/cancelPayPal"
            },
            "transactions": [{
                "item_list": {
                    "items": [{
                        "name": "Red Sox Hat",
                        "sku": "001",
                        "price": USDCurrency,
                        "currency": "USD",
                        "quantity": 1
                    }]
                },
                "amount": {
                    "currency": "USD",
                    "total": USDCurrency
                },
                "description": "Hat for the best team ever"
            }]
        };

        paypal.payment.create(create_payment_json, function (error, payment) {
            if (error) {
                console.error("PayPal payment creation error:", error);
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
        console.error("PayPal payment creation error:", error);
        res.status(500).json({ success: false, message: "PayPal payment creation failed." });
    }
}


const successPayPal = async (req,res) => {
    try {
            const payerId = req.query.PayerID;
            const paymentId = req.query.paymentId;
            const orderData = req.session.order;
            console.log(payerId,paymentId,orderData.subTotal);
            
          
            const execute_payment_json = {
              "payer_id": payerId,
              "transactions": [{
                  "amount": {
                      "currency": "USD",
                      "total": orderData.USDCurrency
                  }
              }]
            };
          
            paypal.payment.execute(paymentId, execute_payment_json, function (error) {
                console.log("j");
                
              if (error) {   
                console.log("k");
                
                  console.log(error.response);
                  throw error;
              } else {
                console.log("i");
                
                  res.redirect("/order/success")
              }
          });
    } catch (error) {
        
    }
}

const cancelPayPal = async(req,res) => {
    try {
            res.redirect("/checkout")
    } catch (error) {
        
    }
}


module.exports = {
    getPayPal,
    successPayPal,
    cancelPayPal
}