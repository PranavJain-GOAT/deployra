const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Create a new Razorpay order
router.post('/order', authenticate, paymentController.createOrder);

// Verify payment signature after checkout
router.post('/verify', authenticate, paymentController.verifyPayment);

module.exports = router;
