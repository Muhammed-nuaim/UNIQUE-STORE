const mongoose = require("mongoose");
const {Schema} = mongoose;

const productOfferSchema = new Schema ({
    offerName:{
        type: String,
        required: true,
        unique : true
    },
    createdOn : {
        type: Date,
        default: Date.now,
        required: true
    },
    expireOn: {
        type: Date,
        required: true
    },
    offerPrice: {
        type: Number,
        required: true
    },
    productId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    }
})

const productOffer = mongoose.model("produtOffer",productOfferSchema)

module.exports = productOffer;