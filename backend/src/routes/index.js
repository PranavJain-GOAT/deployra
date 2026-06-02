const express = require('express');

const authRoutes = require('./auth.routes');
const purchaseRoutes = require('./purchase.routes');
const uploadRoutes = require('./upload.routes');
const userRoutes = require('./user.routes');
const notificationRoutes = require('./notification.routes');
const orderRoutes = require('./order.routes');
const paymentRoutes = require('./payment.routes');
const router = express.Router();

router.use('/auth', authRoutes);
router.use('/purchases', purchaseRoutes);
router.use('/uploads', uploadRoutes);
router.use('/users', userRoutes);
router.use('/notifications', notificationRoutes);
router.use('/orders', orderRoutes);
router.use('/payment', paymentRoutes);

module.exports = router;
