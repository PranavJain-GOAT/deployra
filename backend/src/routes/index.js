const express = require('express');

const authRoutes = require('./auth.routes');
const productRoutes = require('./product.routes');
const purchaseRoutes = require('./purchase.routes');
const developerRoutes = require('./developer.routes');
const uploadRoutes = require('./upload.routes');
const userRoutes = require('./user.routes');
const reviewRoutes = require('./review.routes');
const wishlistRoutes = require('./wishlist.routes');
const messageRoutes = require('./message.routes');
const notificationRoutes = require('./notification.routes');
const orderRoutes = require('./order.routes');
const adminRoutes = require('./admin.routes');
const analyticsRoutes = require('./analytics.routes');
const paymentRoutes = require('./payment.routes');
const router = express.Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/purchases', purchaseRoutes);
router.use('/developer', developerRoutes);
router.use('/uploads', uploadRoutes);
router.use('/users', userRoutes);
router.use('/reviews', reviewRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/messages', messageRoutes);
router.use('/notifications', notificationRoutes);
router.use('/orders', orderRoutes);
router.use('/admin', adminRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/payment', paymentRoutes);

module.exports = router;
