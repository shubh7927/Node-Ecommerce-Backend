const express = require('express');
const { placeNewOrder, viewMyOrders, getAllOrders, updateOrderStatus } = require('../controllers/order');
const { isUserAuthorized, checkAccessLevel } = require('../middlewares/authCheck');
const router = express.Router();

//Place new order --> Logged in user
router.post("/place", isUserAuthorized, placeNewOrder);

//View my orders --> Logged in user
router.get("/myorders", isUserAuthorized, viewMyOrders);

//Get all orders --> SuperAdmin
router.get("/", isUserAuthorized, checkAccessLevel("superadmin"), getAllOrders);

//Update Order Status --> SuperAdmin,Admin
router.patch("/update", isUserAuthorized, checkAccessLevel("superadmin"), updateOrderStatus);

module.exports = router;