const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    customerDetail: {
        address: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        pincode: {
            type: Number,
            required: true,
        },
        phoneNumber: {
            type: Number,
            required: true
        }
    },
    orderItems: [
        {
            name: {
                type: String,
                required: true
            },
            price: {
                type: Number,
                required: true
            },
            quantity: {
                type: Number,
                required: true
            },
            product: {
                type: mongoose.Schema.ObjectId,
                ref: "Product",
                required: true
            },
            
        }
    ],
    orderedBy: {
        type: mongoose.Schema.ObjectId,
        ref: "User"
    },
    payment: {
        id: {
            type: String,
            // required: true
        },
        status: {
            type: String,
            // required: true
        }
    },
    paidAt: {
        type: Date,
        // required: true
    },
    itemsPrice: {
        type: Number,
        // required: true,
    },
    shippingPrice: {
        type: Number,
        // required: true
    },
    totalPrice: {
        type: Number,
        // required: true
    },
    orderStatus: {
        type: String,
        default: "Pending"
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }

});

module.exports = mongoose.model("Order", orderSchema);