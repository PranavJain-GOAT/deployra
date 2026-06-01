const { prisma } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

const getPlatformStats = async (req, res, next) => {
  try {
    const userCount = await prisma.user.count();
    const productCount = await prisma.product.count();
    const purchaseCount = await prisma.purchase.count({ where: { status: 'COMPLETED' } });
    
    // Total Revenue calculation
    const purchases = await prisma.purchase.findMany({
      where: { status: 'COMPLETED' },
      select: { pricePaid: true }
    });
    const totalRevenue = purchases.reduce((acc, p) => acc + p.pricePaid, 0);

    res.status(200).json({
      success: true,
      data: { userCount, productCount, purchaseCount, totalRevenue }
    });
  } catch (error) {
    next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    });
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    next(error);
  }
};

const getPendingProducts = async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      where: { status: 'PENDING' },
      include: { developer: { select: { name: true } } }
    });
    res.status(200).json({ success: true, count: products.length, data: products });
  } catch (error) {
    next(error);
  }
};

const reviewProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // APPROVED or REJECTED

    const product = await prisma.product.update({
      where: { id },
      data: { status }
    });

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPlatformStats,
  getAllUsers,
  getPendingProducts,
  reviewProduct
};
