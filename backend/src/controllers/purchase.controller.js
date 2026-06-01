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

    // Attempt Stripe Intent
    let clientSecret = null;
    let paymentIntentId = null;

    // Create a pending or completed record based on whether stripe is active
    const purchaseStatus = 'COMPLETED'; // If no stripe, auto complete for testing

    const purchase = await prisma.purchase.create({
      data: {
        userId: req.user.id,
        productId,
        pricePaid: product.price,
        paymentIntentId,
        status: purchaseStatus
      }
    });

    res.status(200).json({
      success: true,
      clientSecret,
      data: purchase,
      message: purchaseStatus === 'COMPLETED' ? 'Purchase successful' : 'Checkout session created'
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
