//Importing packages
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require("dotenv");
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const cloudinary = require('cloudinary');

const app = express();

//Importing Routes
const productRoutes = require("./api/routes/product.js");
const userRoutes = require("./api/routes/user.js");
const orderRoutes = require("./api/routes/order.js");

dotenv.config({ path: "./.env" });

//Database Connection
mongoose.connect(process.env.DB_URL, {
    useNewURLParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log("Database Connected Successfully"))
    .catch(err => console.log(err));

//Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Library Configuration
app.use(morgan("dev"));
app.use(cors());
app.use((req, res, next) => {
    res.header("Access-Controll-Allow-Origin", "*");
    res.header(
        "Access-Controll-Allow-Headers",
        "Origin, X-Requested-With, Accept, Authorization, Content-Type"
    );
    if (req.method === "OPTIONS") {
        res.header(
            "Access-Controll-Allow-Methods",
            "PUT, PUSH, PATCH, GET, DELETE"
        );
        res.status(200).json({});
    }
    next();
});
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(fileUpload({
    useTempFiles:true
}));
app.use(cookieParser());
app.use("/product", productRoutes);
app.use("/user", userRoutes);
app.use("/order", orderRoutes);

//Global Error Handler
app.use((req, res, next) => {
    let err = new Error("Page Not Found");
    err.status = 404;
    next(err);
})
app.use((err, req, res, next) => {
    res.status(err.status || 500).json({
        message: err.message
    })
})

module.exports = app;