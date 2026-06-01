const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');

// Create a new Razorpay order
router.post('/order', paymentController.createOrder);

// Verify payment signature after checkout
router.post('/verify', paymentController.verifyPayment);

module.exports = router;
