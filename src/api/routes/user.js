const express = require('express');
const { signin, signup, logout, resetPassword, generateResetPasswordLink, viewProfile, getAllUsers, updateProfile, getSingleUser, updateUserAccess, deleteUser, viewMyCart, addToCart, deleteFromCart } = require('../controllers/user');
const { isUserAuthorized, checkAccessLevel } = require('../middlewares/authCheck.js');
const router = express.Router();

//User Signup
router.post("/signup", signup);

//User Signin
router.post("/signin", signin);

//User logout
router.get("/logout", logout);

//Generate Forgot/Reset Password Link
router.post("/reset", generateResetPasswordLink);

//Forgot/Reset Password
router.patch("/reset/:token", resetPassword);

//View Profile --> Logged In User
router.get("/profile", isUserAuthorized, viewProfile);

//User Update his/her own Profile --> Logged In User
router.patch("/profile/update", isUserAuthorized, updateProfile);

//View My Cart
router.get("/cart", isUserAuthorized, viewMyCart);

//Add To Cart
router.post("/cart", isUserAuthorized, addToCart);

//Delete From Cart
router.delete("/cart/:productId", isUserAuthorized, deleteFromCart);

//Get All Users --> SuperAdmin
router.get("/", isUserAuthorized, checkAccessLevel("superadmin"), getAllUsers);

//Get Single User --> SuperAdmin
router.get("/:id", isUserAuthorized, checkAccessLevel("superadmin"), getSingleUser);

//Change User Access --> SuperAdmin
router.patch("/:id", isUserAuthorized, checkAccessLevel("superadmin"), updateUserAccess);

//Delete User  --> SuperAdmin
router.delete("/:id", isUserAuthorized, checkAccessLevel("superadmin"), deleteUser);


module.exports = router;