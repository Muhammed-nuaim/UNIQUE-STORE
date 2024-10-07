const express = require("express");
const app = express();
const env = require("dotenv").config();
const db = require("./config/db");
const nocache = require('nocache');

db();
app.use(express.static("public"))

app.use(nocache());
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
});



app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const userRouter = require("./routes/userRouter");
// const adminRoute = require("./routes/adminRoute");

app.set('view engine', 'ejs');  // Set the view engine here
app.set('views', './views');    // Set views directory here, make sure it points correctly

app.use('/',userRouter);
// app.use('/admin', adminRoute);

app.listen(process.env.PORT, () => {
    console.log("http://localhost:3000/");
});

module.exports = app;