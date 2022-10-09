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
        const orders = await Order.find({ orderedBy: req.userData.id });
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
        const orders = await Order.find().populate("orderedBy").populate("cart.products");
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

//Get Single Order
// exports.getSingleOrder = async (req, res, next) => {
//     try {
//         const order = await Order.findById(req.params.id).populate("orderedBy");
//         if (!order) {
//             return res.status(404).json({
//                 message: "Order doesn't Exist."
//             })
//         }
//         return res.status(200).json({
//             success: true,
//             order
//         })
//     } catch (error) {
//         console.log(error.stack);
//         return res.status(500).json({
//             message: "Internal Server Error"
//         })
//     }
// }

//Update Order Status
exports.updateOrderStatus = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id).populate("orderedBy");
        if (!order) {
            return res.status(400).json({
                message: "Order doesn't Exist."
            })
        }
        if (order.orderStatus.toLowerCase() === "delievered") {
            return res.status(400).json({
                message: "Cannot change status because order is already delievered"
            })
        }
        order.orderStatus = req.body.orderStatus;
        await order.save({ validateBeforeSave: false });
        return res.status(200).json({
            message: "Order Status updated.",
            order
        })
    } catch (error) {
        console.log(error.stack);
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

//Delete a order
exports.deleteOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id)
        if (!order) {
            return res.status(400).json({
                message: "Order doesn't Exist."
            })
        }
        await order.remove();
        return res.status(200).json({
            message: "Order deleted Successfully."
        })
    } catch (error) {
        console.log(error.stack);
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

