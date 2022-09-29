const express = require('express');
const { getAllProducts, createProduct, updateProduct, getSingleProduct, deleteProduct } = require('../controllers/product');
const { isUserAuthorized, checkAccessLevel } = require('../middlewares/authCheck');
const router = express.Router();


//Create a new product --> Admin
router.post("/", isUserAuthorized, checkAccessLevel("admin","superadmin"), createProduct);
// router.post("/",createProduct);

//Get all products
router.get("/", getAllProducts);

//Get Single Product 
router.get("/:id", getSingleProduct);

//Update a Product --> Admin  
router.patch("/:id", isUserAuthorized, checkAccessLevel("admin","superadmin"), updateProduct);

//Delete a Product --> Admin  
router.delete("/:id", isUserAuthorized, checkAccessLevel("admin","superadmin"), deleteProduct);

module.exports = router;
