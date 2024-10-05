const express = require("express")
const app = express()
const env = require("dotenv").config();
const db =require("./config/db");
const { connect } = require("mongoose");
const connectDB = require("./config/db");

db()

app.listen(process.env.PORT, () => {
    console.log("Server is Running");
})

module.exports = app