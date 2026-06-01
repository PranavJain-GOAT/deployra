const { prisma } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

const getDashboardStats = async (req, res, next) => {
  try {
    const devId = req.user.id;

    // Get all products of the developer
    const products = await prisma.product.findMany({
      where: { developerId: devId },
      include: {
        purchases: {
          where: { status: 'COMPLETED' },
          select: { pricePaid: true, createdAt: true, user: { select: { name: true, email: true } } }
        },
        reviews: {
          select: { rating: true }
        }
      }
    });

    const totalProducts = products.length;
    const publishedProductsCount = products.filter(p => p.status === 'APPROVED').length;
    const pendingProductsCount = products.filter(p => p.status === 'PENDING').length;
    const rejectedProductsCount = products.filter(p => p.status === 'REJECTED').length;

    const pendingOrdersCount = await prisma.order.count({
      where: {
        product: {
          developerId: devId
        }
      }
    });

    let totalRevenue = 0;
    let totalSales = 0;
    let totalViews = 0;
    let totalDemoViews = 0;
    let ratingsSum = 0;
    let ratingsCount = 0;
    const recentSales = [];
    let revenueToday = 0;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    products.forEach(p => {
      totalViews += p.views || 0;
      totalDemoViews += p.demoViews || 0;
      p.purchases.forEach(pur => {
        totalRevenue += pur.pricePaid;
        totalSales += 1;
        if (new Date(pur.createdAt) >= todayStart) {
          revenueToday += pur.pricePaid;
        }
        recentSales.push({
          id: pur.id,
          productTitle: p.title,
          pricePaid: pur.pricePaid,
          createdAt: pur.createdAt,
          buyerName: pur.user.name,
          buyerEmail: pur.user.email
        });
      });
      p.reviews.forEach(r => {
        ratingsSum += r.rating;
        ratingsCount += 1;
      });
    });

    const avgRating = ratingsCount > 0 ? ratingsSum / ratingsCount : 0;

    // Sort recent sales by createdAt desc and take top 10
    recentSales.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const topRecentSales = recentSales.slice(0, 10);

    // Revenue by month for the last 6 months
    const monthlyRevenue = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = d.toLocaleString('default', { month: 'short' });
      const year = d.getFullYear();
      monthlyRevenue.push({
        month: `${monthName} ${year}`,
        monthIndex: d.getMonth(),
        year: year,
        revenue: 0,
        sales: 0
      });
    }

    products.forEach(p => {
      p.purchases.forEach(pur => {
        const purDate = new Date(pur.createdAt);
        const purMonth = purDate.getMonth();
        const purYear = purDate.getFullYear();
        const bucket = monthlyRevenue.find(b => b.monthIndex === purMonth && b.year === purYear);
        if (bucket) {
          bucket.revenue += pur.pricePaid;
          bucket.sales += 1;
        }
      });
    });

    const monthlyData = monthlyRevenue.map(b => ({
      month: b.month,
      revenue: b.revenue,
      sales: b.sales
    }));

    const conversionRate = totalViews > 0 ? (totalSales / totalViews) * 100 : 0;

    // Fetch recent reviews for the developer's products
    const recentReviewsRaw = await prisma.review.findMany({
      where: {
        product: {
          developerId: devId
        }
      },
      include: {
        user: { select: { name: true } },
        product: { select: { title: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    const formattedReviews = recentReviewsRaw.map(r => ({
      id: r.id,
      name: r.user?.name || "Anonymous",
      product: r.product?.title || "Product",
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt
    }));

    res.status(200).json({
      success: true,
      data: {
        totalProducts,
        publishedProductsCount,
        pendingProductsCount,
        rejectedProductsCount,
        totalSales,
        totalRevenue,
        totalViews,
        totalDemoViews,
        avgRating,
        conversionRate: parseFloat(conversionRate.toFixed(2)),
        monthlyRevenue: monthlyData,
        recentSales: topRecentSales,
        recentReviews: formattedReviews,
        revenueToday,
        pendingOrdersCount
      }
    });
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
