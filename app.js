const express = require("express");
const app = express();
const env = require("dotenv").config();
const db = require("./config/db");

db();
app.use(express.static("public"))

const userRoute = require("./routes/userRoute");
// const adminRoute = require("./routes/adminRoute");

app.set('view engine', 'ejs');  // Set the view engine here
app.set('views', './views');    // Set views directory here, make sure it points correctly

app.use('/', userRoute);
// app.use('/admin', adminRoute);

app.listen(process.env.PORT, () => {
    console.log("http://localhost:3000/");
});

module.exports = app;