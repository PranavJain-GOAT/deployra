const { prisma } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

const checkout = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const product = await prisma.product.findUnique({ where: { id: productId } });

    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    if (product.status !== 'APPROVED') {
      return next(new AppError('Product is not available for purchase', 400));
    }

    // Check if user already owns it
    const existingPurchase = await prisma.purchase.findFirst({
      where: { userId: req.user.id, productId, status: 'COMPLETED' }
    });

    if (existingPurchase) {
      return res.status(400).json({ success: false, message: 'You already own this product' });
    }

    // Create completed purchase record
    const purchaseStatus = 'COMPLETED';

    const purchase = await prisma.purchase.create({
      data: {
        userId: req.user.id,
        productId,
        pricePaid: product.price,
        status: purchaseStatus
      }
    });

    // 1. Create linked Order
    await prisma.order.create({
      data: {
        userId: req.user.id,
        productId,
        details: `Purchase of "${product.title}" for $${product.price}`
      }
    });

    // 2. Create Notifications
    // Developer notification
    await prisma.notification.create({
      data: {
        userId: product.developerId,
        type: 'SALE_RECEIVED',
        title: 'New Product Sale!',
        message: `Your product "${product.title}" was purchased by ${req.user.name || req.user.email} for $${product.price}.`
      }
    });

    // Buyer notification
    await prisma.notification.create({
      data: {
        userId: req.user.id,
        type: 'PURCHASE_CONFIRMED',
        title: 'Purchase Confirmed',
        message: `Thank you for purchasing "${product.title}". You can now access/download it from your dashboard.`
      }
    });

    // 3. Create Activities
    // Developer Activity
    await prisma.activity.create({
      data: {
        userId: product.developerId,
        type: 'ORDER_RECEIVED',
        title: 'New Order Received',
        body: `Your product "${product.title}" has been purchased by ${req.user.name || req.user.email} for $${product.price}.`,
        meta: JSON.stringify({ productId, purchaseId: purchase.id })
      }
    });

    // Buyer Activity
    await prisma.activity.create({
      data: {
        userId: req.user.id,
        type: 'PRODUCT_PURCHASED',
        title: 'Product Purchased',
        body: `You successfully purchased "${product.title}" for $${product.price}.`,
        meta: JSON.stringify({ productId, purchaseId: purchase.id })
      }
    });

    res.status(200).json({
      success: true,
      clientSecret: null,
      data: purchase,
      message: 'Purchase successful'
    });
  } catch (error) {
    next(error);
  }
};

const getMyPurchases = async (req, res, next) => {
  try {
    const purchases = await prisma.purchase.findMany({
      where: { userId: req.user.id },
      include: { product: true },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ success: true, count: purchases.length, data: purchases });
  } catch (error) {
    next(error);
  }
};

const checkOwnership = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const purchase = await prisma.purchase.findFirst({
      where: { userId: req.user.id, productId, status: 'COMPLETED' }
    });

    res.status(200).json({ success: true, isOwned: !!purchase });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkout,
  getMyPurchases,
  checkOwnership
};
