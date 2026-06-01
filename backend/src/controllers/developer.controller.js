const { prisma } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

const getDashboardStats = async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      where: { developerId: req.user.id },
      include: {
        _count: { select: { purchases: { where: { status: 'COMPLETED' } } } }
      }
    });

    const totalProducts = products.length;
    let totalSales = 0;
    
    // Naively summing, in reality use aggregation
    products.forEach(p => {
      totalSales += (p._count.purchases * p.price);
    });

    res.status(200).json({ success: true, data: { totalProducts, totalSales } });
  } catch (error) {
    next(error);
  }
};

const getMyListings = async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      where: { developerId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { purchases: true, reviews: true } }
      }
    });

    res.status(200).json({ success: true, count: products.length, data: products });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getMyListings
};
