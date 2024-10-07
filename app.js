const express = require("express");
const app = express();
const env = require("dotenv").config();
const db = require("./config/db");

db();
app.use(express.static("public"))

user_route.use(nocache());
user_route.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
});


app.use(express.urlencoded({ extended: true }));
app.use(express.json());

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