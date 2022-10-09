const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderItems: [
        {
            product: {
                type: mongoose.Schema.ObjectId,
                ref: "Product",
                required: true
            },
            quantity: Number
        }
    ],
    orderedBy: {
        type: mongoose.Schema.ObjectId,
        ref: "User"
    },
    status: {
        type: String,
        default: "Pending"
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }

});

module.exports = mongoose.model("Order", orderSchema);