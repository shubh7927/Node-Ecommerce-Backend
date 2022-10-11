const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderItems: [
        {
            product: {
                type: mongoose.Schema.ObjectId,
                ref: "Product",
                required: true
            },
            quantity: Number,
            status: {
                type: String,
                default: "Pending"
            },
        }
    ],
    orderedBy: {
        type: mongoose.Schema.ObjectId,
        ref: "User"
    },

    createdAt: {
        type: Date,
        default: Date.now()
    }

});

module.exports = mongoose.model("Order", orderSchema);