const mongoose = require("mongoose");
const {Schema} = mongoose;
const {v4:uuidv4} = require('uuid');

const orderSchema = new Schema ({
    orderId: {
        type: String,
        default: ()=>uuidv4(),
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    orderedItems: [{
        productId: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },
        productImage: {
            type:[String],
            required: true
        },
        productName: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        price: {
            type: Number,
            default: 0
        },
        totalPrice: {
            type:Number,
            required: true
        },
        cancelled: {
            type:Boolean,
            default:false
        },
        status: {
        type: String,
        required: true,
        enum:['Pending','Processing','Shipped','Delivered','Cancelled','Return Request','Returned'],
        default: 'Processing'
    },
    }],
    address: [{
        addressType: {
            type: String,
            enum: ["Home", "WorkSpace", "Shop"], 
            required: true
        },
        name: {
            type: String,
            required: true,
        },
        city: {
            type: String,
            required: true,
        },
        landMark: {
            type: String,
            required: false,
        },
        state: {
            type: String,
            required: true,
        },
        pincode: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
            required: true,
        },
        altPhone: {
            type: String,
            required: false,
        }
    }],
    paymentMethod: {
        type:String,
        required:true
    },
    discount: {
        type: Number,
        required: false
    },
    finalAmount: {
        type: Number,
        required: true
    },
    cancelled: {
        type:Boolean,
        default:false
    },
    invoiceDate: {
        type: Date
    },
    status: {
        type: String,
        required: true,
        enum:['Pending','Processing','Shipped','Delivered','Cancelled','Return Request','Returned'],
        default: 'Processing'
    },
    createdOn: {
        type: Date,
        default: Date.now,
        required: true
    },
    couponApplied: {
        type: Boolean,
        default: false
    }
})

const Order = mongoose.model("Order",orderSchema)

module.exports = Order;