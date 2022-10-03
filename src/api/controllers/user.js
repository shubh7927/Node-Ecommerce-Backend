const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const validator = require("validator");
const cloudinary = require('cloudinary');
const crypto = require('crypto');

const User = require("../models/user.js");
const sendEmail = require("../utils/sendEmail.js");
const { uploadImage, deleteImage } = require('../utils/handleImages.js');

dotenv.config({ path: "./.env" });

//Signup a new user
exports.signup = async (req, res, next) => {
    try {
        //Converting User given password into hashed Password
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).json({
                message: "User Already Exists."
            })
        }

        if (req.files) {
            const result = await uploadImage(req.files.picture, 'profilepic');
            req.body.profilePic = result;
        }


        //Encrypting The Password
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        req.body.password = hashedPassword;

        //Saving User in DB
        const user = await User.create(req.body);

        //Creating a JWT token to assure user is logged in.
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
            expiresIn: "1h"
        });


        return res.status(201).json({
            success: true,
            access: user.access,
            token,
            user
        })
    } catch (error) {
        console.log(error.stack);
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

//Signin an Existing User
exports.signin = async (req, res, next) => {
    try {
        //Checking if email/user exists in DB
        const user = await User.findOne({ email: req.body.email });

        //If user/email does not exist in DB
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid Email Or Password."
            })
        }

        //Comparing the password with hashed password stored in DB
        const correctPassword = await bcrypt.compare(req.body.password, user.password);
        if (!correctPassword) {
            return res.status(401).json({
                success: false,
                message: "Invalid Email Or Password."
            })
        }

        //Creating a JWT token to assure user is logged in.
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
            expiresIn: "1h"
        });


        return res.status(200).json({
            success: true,
            message: "Logged in successfully",
            token,
            access: user.access
        })


    } catch (error) {
        console.log(error.stack);
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

//Logout a User
exports.logout = async (req, res, next) => {
    try {
        req.headers.authorization = null;
        return res.status(200).json({
            success: true,
            message: "Logged Out Successfully"
        })
    } catch (error) {
        console.log(error.stack);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
}

//Generate Reset Password Link and send on mail.
exports.generateResetPasswordLink = async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    try {
        const resetToken = crypto.randomBytes(20).toString("hex");
        if (!user) {
            return res.status(404).json({
                message: "Email doesn't exist."
            })
        }
        user.resetPasswordCode = crypto.createHash("sha256").update(resetToken).digest("hex");
        user.resetPasswordExpiry = Date.now() + 5 * 60 * 1000;

        await user.save({ validateBeforeSave: false });

        const resetURL = `${process.env.FRONTEND_BASE_URL}/reset/${resetToken}`;
        const emailSubject = `Account Password Reset`;
        const emailBody = `Click Here to reset Your Password:\n\n ${resetURL} \n\n Ignore this mail if you haven't requested it.`;

        await sendEmail({
            email: user.email,
            subject: emailSubject,
            body: emailBody
        })

        return res.status(200).json({
            message: `Email Sent to ${user.email} Successfully`,
            resetToken,
            resetURL
        })
    } catch (error) {
        console.log(error.stack);
        user.resetPasswordCode = undefined;
        user.resetPasswordExpiry = undefined;
        await user.save({ validateBeforeSave: false });
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }


}

//Reset Password using the link
exports.resetPassword = async (req, res, next) => {
    try {
        const resetPasswordCode = crypto.createHash("sha256").update(req.params.token).digest("hex");
        const user = await User.findOne({
            resetPasswordCode,
            resetPasswordExpiry: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({
                message: "Invalid or expired Token"
            })
        }
        if (req.body.password != req.body.confirmPassword) {
            return res.status(400).json({
                message: "Password do not match."
            })
        }
        if (!validator.isStrongPassword(req.body.password)) {
            return res.status(400).json({
                message: "Please enter a strong password"
            })
        }
        user.password = await bcrypt.hash(req.body.password, 10);
        user.resetPasswordCode = undefined;
        user.resetPasswordExpiry = undefined;

        await user.save({ validateModifiedOnly: true });


        return res.status(201).json({
            success: true
        })

    } catch (error) {
        console.log(error.stack);
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

//View Profile
exports.viewProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.userData.id);
        return res.status(200).json({
            success: true,
            user
        })
    } catch (error) {
        console.log(error.stack);
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

//Update Own Profile
exports.updateProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.userData.id);
        if (req.body.fullName) {
            user.fullName = req.body.fullName;
        }
        if (req.body.address) {
            user.address = req.body.address;
        }
        if (req.body.email) {
            if (!validate.isEmail(req.body.email)) {
                return res.status(400).json({
                    message: "Enter a valid email"
                })
            }
            user.email = req.body.email;
        }

        await user.save({ validateBeforeSave: false });
        return res.status(200).json({
            message: "Profile Updated Successfully"
        })
    } catch (error) {
        console.log(error.stack);
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }

}

//View My Cart
exports.viewMyCart = async (req, res, next) => {
    try {
        const user = await User.findById(req.userData.id).populate("cart.product");
        const cartItems = user.cart;
        return res.status(200).json({
            success: true,
            cartItems
        })
    } catch (error) {
        console.log(error.stack);
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

//Add Item To cart
exports.addToCart = async (req, res, next) => {
    try {
        const user = await User.findById(req.userData.id);
        const cartItem = user.cart.find(item => item.product == req.body.product);
        if (cartItem) {
            cartItem.quantity++;
        } else {
            const item = {
                product: req.body.product,
                quantity: 1
            }
            user.cart.push(item);
        }
        await user.save({ validateModifiedOnly: true });
        return res.status(200).json({
            success: true,
            message: "Added To Cart Successfully",
            cart: user.cart
        })
    } catch (error) {
        console.log(error.stack);
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

//Delete Item from cart
exports.deleteFromCart = async (req, res, next) => {
    try {
        const productId = req.params.productId;
        const user = await User.findById(req.userData.id);
        const idx = user.cart.findIndex(item => item.product == productId);
        console.log(idx);
        if (user.cart[idx].quantity > 1) {
            user.cart[idx].quantity--;
        } else {
            user.cart.splice(idx, 1);
        }
        await user.save({ validateModifiedOnly: true });
        return res.status(200).json({
            success: true,
            message: `Item removed from cart`
        })
    } catch (error) {
        console.log(error.stack);
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

//Get All Users
exports.getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find();
        return res.status(200).json({
            success: true,
            users
        })
    } catch (error) {
        console.log(error.stack);
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

//Get Single User
exports.getSingleUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                message: "User Not found"
            })
        }

        return res.status(200).json({
            success: true,
            user
        })
    } catch (error) {
        console.log(error.stack);
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

//Update user access
exports.updateUserAccess = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                message: "User Not found"
            })
        }
        user.access = req.body.access;
        await user.save({ validateBeforeSave: false })
        return res.status(200).json({
            success: true,
            message: "Access Updated Successfully"
        })
    } catch (error) {
        console.log(error.stack);
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

//Delete User
exports.deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                message: "User Not found"
            })
        }
        if (user.profilePic) {
            await deleteImage(user.profilePic.public_id);
        }
        await User.findByIdAndDelete(req.params.id);
        return res.status(200).json({
            success: true,
            message: "User Deleted Successfully"
        })
    } catch (error) {
        console.log(error.stack);
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}