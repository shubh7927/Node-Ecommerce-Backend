const jwt = require("jsonwebtoken");
const User = require("../models/user.js");

exports.isUserAuthorized = async (req, res, next) => {
    try {
        if (!req.headers.authorization) {
            return res.status(401).json({
                message: "Cannot access the Resouce. Please Login first"
            })
        }
        const token = req.headers.authorization.split(" ")[1];
        if (!token) {
            return res.status(401).json({
                message: "Cannot access the Resouce. Please Login first"
            })
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.userData = await User.findById(decoded.id);
        next();
    } catch (error) {
        console.log(error.stack);
        return res.status(401).json({
            message: "Authorization Failed. Please make sure your credentials are correct."
        })
    }
}

exports.checkAccessLevel = (...access) => {
    return (req, res, next) => {
        if (!access.includes(req.userData.access)) {
            return res.status(401).json({
                message: "You are not authorized to access this resource."
            })
        }

        next();
    }
}