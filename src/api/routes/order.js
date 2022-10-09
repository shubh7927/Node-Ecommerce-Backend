const express = require('express');
const { placeNewOrder, viewMyOrders, getSingleOrder, getAllOrders, updateOrderStatus, deleteOrder } = require('../controllers/order');
const { isUserAuthorized, checkAccessLevel } = require('../middlewares/authCheck');
const router = express.Router();

//Place new order --> Logged in user
router.post("/place", isUserAuthorized, placeNewOrder);

//View my orders --> Logged in user
router.get("/myorders", isUserAuthorized, viewMyOrders);

//Get all orders --> SuperAdmin
router.get("/", isUserAuthorized, checkAccessLevel("superadmin"), getAllOrders);


//Update Order Status --> SuperAdmin
router.patch("/:id", isUserAuthorized, checkAccessLevel("superadmin"), updateOrderStatus);

//Delete a order --> SuperAdmin
router.delete("/:id", isUserAuthorized, checkAccessLevel("superadmin"), deleteOrder);

module.exports = router;