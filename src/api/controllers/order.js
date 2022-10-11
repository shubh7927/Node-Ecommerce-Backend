const Order = require("../models/order.js");
const User = require("../models/user.js");
const sendEmail = require("../utils/sendEmail.js");

//Place new order
exports.placeNewOrder = async (req, res, next) => {
    try {
        const user = await User.findById(req.userData.id).populate("cart.product");
        const cartItems = user.cart;
        if (cartItems.length == 0) {
            return res.status(400).json({
                message: "Cart Cannot Be Empty."
            })
        }
        const orderItems = [];
        for (let i = 0; i < cartItems.length; i++) {
            orderItems.push(cartItems[i]);
        }
        const orderObj = {
            orderItems,
            orderedBy: req.userData.id
        }
        const order = await Order.create(orderObj);

        const email = user.email;
        const subject = `Order Placed Successfully`;
        let emailBody = 'Your order has been placed successfully. Following Items will be delievered to you within 3 - 7 working days: \n\n';
        for (let i = 0; i < cartItems.length; i++) {
            emailBody += `${i + 1}. ${cartItems[i].product.name}(${cartItems[i].quantity}  Units)`
        }
        await sendEmail({
            email,
            subject,
            body: emailBody
        })
        return res.status(201).json({
            success: true,
            message: "Order Placed Successfully.",
            order
        })
    } catch (error) {
        console.log(error.stack);
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

//View My orders
exports.viewMyOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({ orderedBy: req.userData.id }).populate("orderItems.product");
        return res.status(200).json({
            success: true,
            orders
        })
    } catch (error) {
        console.log(error.stack);
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

//Get All Orders
exports.getAllOrders = async (req, res, next) => {
    try {
        const orders = await Order.find().populate(["orderedBy", "orderItems.product"]);
        return res.status(200).json({
            success: true,
            orders
        })
    } catch (error) {
        console.log(error.stack);
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

//Update Order Status
exports.updateOrderStatus = async (req, res, next) => {
    try {
        const order = await Order.findById(req.query.oid);
        if (!order) {
            return res.status(400).json({
                message: "Order doesn't Exist."
            })
        }

        const orderItem = order.orderItems.find(item => item.product._id == req.query.pid);
        if (!orderItem) {
            return res.status(400).json({
                message: "Order doesn't Exist."
            })
        }
        if (orderItem.status.toLowerCase() === "delivered") {
            return res.status(400).json({
                message: "Cannot change status because order is already delivered"
            })
        }
        orderItem.status = req.body.newStatus;
        await order.save({ validateBeforeSave: false });
        return res.status(200).json({
            message: "Order Status updated.",
            orderItem
        })
    } catch (error) {
        console.log(error.stack);
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}
