const Product = require("../models/product.js");
const { generateNum } = require("../utils/generateRandomNum.js");
const { uploadImage, deleteImage } = require('../utils/handleImages.js');


//Create a new Product
exports.createProduct = async (req, res, next) => {
    try {
        req.body.createdBy = req.userData.id;
        req.body.category = req.body.category.toLowerCase();
        req.body.rating = generateNum();

        const productImage = req.files.productImage;
        const imageData = await uploadImage(productImage, 'productimages');
        req.body.image = imageData;

        const product = await Product.create({ ...req.body });
        return res.status(201).json({
            success: true,
            message: "Product Created successfully",
            product
        })
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

//Get all products
exports.getAllProducts = async (req, res, next) => {
    try {
        const RESULT_PER_PAGE = 6;
        let search;
        let category;
        if (req.query.search) {
            search = {
                name: {
                    $regex: req.query.search,
                    $options: "i"
                }
            }
        }
        if (req.query.category) {
            category = {
                category: req.query.category,
                $options: "i"
            }
        }

        const currentPage = parseInt(req.query.page) || 1;
        const skip = RESULT_PER_PAGE * (currentPage - 1);


        const allProducts = await Product.find({ ...search, ...category }).limit(RESULT_PER_PAGE).skip(skip);
        return res.status(200).json({
            success: true,
            allProducts
        });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
}

//Get a single product
exports.getSingleProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product doesn't exist."
            })
        }

        return res.status(200).json({
            success: true,
            product
        })
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

//Update a product
exports.updateProduct = async (req, res, next) => {
    try {
        console.log(req.body);
        let product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product doesn't exist."
            })
        }
        product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
            useFindAndModify: false
        });
        return res.status(200).json({
            success: true,
            message: "Product Updated Successfully",
            product
        })
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

//Delete a Product
exports.deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product doesn't exist."
            })
        }
        await deleteImage(product.image.public_id);
        await Product.findByIdAndDelete(req.params.id);
        return res.status(200).json({
            success: true,
            message: "Product deleted Successfully"
        })

    } catch (error) {
        console.log(error.message)
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
} 