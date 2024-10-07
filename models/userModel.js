const mongoose = require("mongoose");
const {Schema} = mongoose;


const userSchema = new Schema({
    name: {
        type: String,
        required:true
    },
    email: {
         type: String,
         required:true,
         unique: true
    },
    password : {
        type: String,
        required: true
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
})

const User = mongoose.model("User",userSchema)

module.exports = User;