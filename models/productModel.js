const mongoose = require("mongoose");
const {Schema} = mongoose;

const productSchema = new Schema({
    productName: {
        type: String,
        required: true
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: "Category",
        required: true
    },
    brand: {
        type: Schema.Types.ObjectId,
        ref: "Brand",
        required: true
    },
    regularPrice: {
        type: Number,
        required: true
    },
    salePrice: {
        type: Number,
        required: true
    },
    productOffer : {
        type: Number,
        dafault: 0
    },
    quantity: {
        type: Number,
        dafault: true
    },
    productImage: {
        type: [image],
        required: true
    },
    isBlocked: {
        type: Boolean,
        default: true
    },
    status:{
        type: String,
        enum: ["Available","Out Of stock","Dicontinued"],
        required: true,
        default: "Availabe"
    },
},{timestamps: true})

const Product = mogoose.model("Product",productSchema)

module.exports = Product;