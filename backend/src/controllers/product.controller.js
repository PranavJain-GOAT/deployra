const { prisma } = require('../config/database');
const { sendProductSubmissionNotification } = require('../services/email.service');
const logger = require('../utils/logger');

const ADMIN_EMAIL = 'pranavjain792879@gmail.com';

// ─── Helper: safe JSON parse ──────────────────────────────────────────────────
const safeJson = (str) => {
  try { return JSON.parse(str); } catch { return null; }
};

// ─── POST /products ─ Create & submit product for review ─────────────────────
const createProduct = async (req, res, next) => {
  try {
    const developerId = req.user.id;
    const {
      title, shortDesc = '', description, category = '',
      tags = [], features = [], industries = [], requirements = [],
      price, deliveryDays = 7, revisions = '2',
      support = '30 Days', deploymentMethod = 'Developer Hosted',
      hostingRequirements = '', coverImage = '', screenshots = [],
      videoUrl = '', demoUrl = '', docsUrl = '', walkthroughUrl = '',
      configFields = [],
      // draft mode
      isDraft = false,
    } = req.body;

    if (!title || !description || !price) {
      return res.status(400).json({ success: false, message: 'title, description, and price are required.' });
    }

    const product = await prisma.product.create({
      data: {
        title: title.trim(),
        shortDesc: shortDesc.trim(),
        description: description.trim(),
        category: category.trim(),
        tags,
        features,
        industries,
        requirements,
        price: parseFloat(price),
        deliveryDays: parseInt(deliveryDays, 10),
        revisions: String(revisions),
        support,
        deploymentMethod,
        hostingRequirements,
        coverImage,
        screenshots,
        videoUrl,
        demoUrl,
        docsUrl,
        walkthroughUrl,
        configSchema: configFields.length > 0 ? JSON.stringify(configFields) : null,
        status: isDraft ? 'DRAFT' : 'PENDING_REVIEW',
        developerId,
      },
      include: {
        developer: { select: { id: true, name: true, email: true } },
      },
    });

    // Fire admin notification email (non-blocking)
    if (!isDraft) {
      sendProductSubmissionNotification(ADMIN_EMAIL, product, product.developer).catch(err => {
        logger.error('Admin notification email failed:', err.message);
      });
    }

    return res.status(201).json({
      success: true,
      message: isDraft ? 'Product saved as draft.' : 'Product submitted for review. The admin will be notified.',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /products/my ─ Developer's own products ─────────────────────────────
const getMyProducts = async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      where: { developerId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { purchases: true, reviews: true, views: true } },
      },
    });

    if (products.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    const productIds = products.map(p => p.id);

    // Grouped revenue query to avoid N+1 queries
    const revenues = await prisma.purchase.groupBy({
      by: ['productId'],
      where: { productId: { in: productIds }, status: 'COMPLETED' },
      _sum: { pricePaid: true },
    });

    // Grouped ratings query to avoid N+1 queries
    const avgRatings = await prisma.review.groupBy({
      by: ['productId'],
      where: { productId: { in: productIds } },
      _avg: { rating: true },
    });

    // Create lookup maps
    const revenueMap = {};
    revenues.forEach(r => {
      revenueMap[r.productId] = r._sum.pricePaid || 0;
    });

    const ratingMap = {};
    avgRatings.forEach(r => {
      ratingMap[r.productId] = r._avg.rating || 0;
    });

    const enriched = products.map((p) => {
      const revenue = revenueMap[p.id] || 0;
      const rating = ratingMap[p.id] || 0;
      return {
        ...p,
        configSchema: p.configSchema ? safeJson(p.configSchema) : null,
        revenue,
        orders: p._count.purchases,
        views: p._count.views,
        reviewCount: p._count.reviews,
        rating: rating ? parseFloat(rating.toFixed(1)) : 0,
        verificationStatus: p.status,
      };
    });

    return res.status(200).json({ success: true, data: enriched });
  } catch (error) {
    next(error);
  }
};

// ─── GET /products/public ─ Approved products for marketplace ─────────────────
const getPublicProducts = async (req, res, next) => {
  try {
    const { category, search, limit = 50, offset = 0 } = req.query;

    const where = {
      status: 'APPROVED',
      ...(category && category !== 'All' ? { category } : {}),
      ...(search ? {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { shortDesc: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { category: { contains: search, mode: 'insensitive' } },
        ],
      } : {}),
    };

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit, 10),
      skip: parseInt(offset, 10),
      include: {
        developer: { select: { id: true, name: true, email: true } },
        _count: { select: { purchases: true, reviews: true } },
      },
    });

    if (products.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    const productIds = products.map(p => p.id);

    // Grouped ratings query to avoid N+1 queries
    const avgRatings = await prisma.review.groupBy({
      by: ['productId'],
      where: { productId: { in: productIds } },
      _avg: { rating: true },
    });

    // Create lookup map
    const ratingMap = {};
    avgRatings.forEach(r => {
      ratingMap[r.productId] = r._avg.rating || 0;
    });

    const enriched = products.map((p) => {
      const rating = ratingMap[p.id] || 0;
      return {
        ...p,
        configSchema: undefined, // don't expose config schema publicly
        installs: p._count.purchases,
        reviews: p._count.reviews,
        rating: rating ? parseFloat(rating.toFixed(1)) : 0,
        vendor: p.developer?.name || 'Unknown',
        verified: true,
      };
    });

    return res.status(200).json({ success: true, data: enriched });
  } catch (error) {
    next(error);
  }
};

// ─── GET /products/:id ─ Single product ──────────────────────────────────────
const getProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        developer: { select: { id: true, name: true, email: true, profileImage: true } },
        reviews: {
          include: { user: { select: { id: true, name: true, profileImage: true } } },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: { select: { purchases: true, reviews: true, views: true } },
      },
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Only APPROVED products are visible publicly; owners can see their own
    const isOwner = req.user && product.developerId === req.user.id;
    const isAdmin = req.user && req.user.role === 'ADMIN';

    if (product.status !== 'APPROVED' && !isOwner && !isAdmin) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Track view (non-blocking)
    if (product.status === 'APPROVED') {
      prisma.productView.create({
        data: {
          productId: id,
          visitorId: req.user?.id || 'anon',
        },
      }).catch(() => {});
    }

    const avgRating = await prisma.review.aggregate({
      where: { productId: id },
      _avg: { rating: true },
    });

    return res.status(200).json({
      success: true,
      data: {
        ...product,
        configSchema: product.configSchema ? safeJson(product.configSchema) : null,
        vendor: product.developer?.name,
        rating: avgRating._avg.rating ? parseFloat(avgRating._avg.rating.toFixed(1)) : 0,
        installs: product._count.purchases,
        reviewCount: product._count.reviews,
        viewCount: product._count.views,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── PATCH /products/:id ─ Update own product (DRAFT or REJECTED only) ────────
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    if (product.developerId !== req.user.id) return res.status(403).json({ success: false, message: 'Forbidden.' });
    if (product.status === 'APPROVED') return res.status(400).json({ success: false, message: 'Approved products cannot be edited directly. Contact support.' });

    const {
      title, shortDesc, description, category, tags, features, industries, requirements,
      price, deliveryDays, revisions, support, deploymentMethod, hostingRequirements,
      coverImage, screenshots, videoUrl, demoUrl, docsUrl, walkthroughUrl, configFields,
      resubmit = false,
    } = req.body;

    const updateData = {
      ...(title !== undefined && { title: title.trim() }),
      ...(shortDesc !== undefined && { shortDesc: shortDesc.trim() }),
      ...(description !== undefined && { description: description.trim() }),
      ...(category !== undefined && { category: category.trim() }),
      ...(tags !== undefined && { tags }),
      ...(features !== undefined && { features }),
      ...(industries !== undefined && { industries }),
      ...(requirements !== undefined && { requirements }),
      ...(price !== undefined && { price: parseFloat(price) }),
      ...(deliveryDays !== undefined && { deliveryDays: parseInt(deliveryDays, 10) }),
      ...(revisions !== undefined && { revisions: String(revisions) }),
      ...(support !== undefined && { support }),
      ...(deploymentMethod !== undefined && { deploymentMethod }),
      ...(hostingRequirements !== undefined && { hostingRequirements }),
      ...(coverImage !== undefined && { coverImage }),
      ...(screenshots !== undefined && { screenshots }),
      ...(videoUrl !== undefined && { videoUrl }),
      ...(demoUrl !== undefined && { demoUrl }),
      ...(docsUrl !== undefined && { docsUrl }),
      ...(walkthroughUrl !== undefined && { walkthroughUrl }),
      ...(configFields !== undefined && { configSchema: configFields.length > 0 ? JSON.stringify(configFields) : null }),
    };

    // If resubmitting a rejected product, set back to PENDING_REVIEW
    if (resubmit && product.status === 'REJECTED') {
      updateData.status = 'PENDING_REVIEW';
      updateData.rejectionReason = null;
    }

    const updated = await prisma.product.update({ where: { id }, data: updateData });

    // Send admin notification if resubmitting
    if (resubmit && product.status === 'REJECTED') {
      const developer = await prisma.user.findUnique({ where: { id: req.user.id }, select: { name: true, email: true } });
      sendProductSubmissionNotification(ADMIN_EMAIL, updated, developer).catch(err => {
        logger.error('Admin notification email failed:', err.message);
      });
    }

    return res.status(200).json({ success: true, message: 'Product updated.', data: updated });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /products/:id ─ Delete own product ────────────────────────────────
const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    if (product.developerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }

    await prisma.product.delete({ where: { id } });
    return res.status(200).json({ success: true, message: 'Product deleted.' });
  } catch (error) {
    next(error);
  }
};

// ─── POST /products/:id/view ─ Track product view ────────────────────────────
const trackView = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.productView.create({
      data: { productId: id, visitorId: req.user?.id || 'anon' },
    });
    return res.status(200).json({ success: true });
  } catch {
    return res.status(200).json({ success: true }); // silent fail
  }
};

// ─── GET /products/analytics/:id ─ Product analytics ─────────────────────────
const getProductAnalytics = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    if (product.developerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }

    const [views, orders, revenue, avgRating, reviewCount] = await Promise.all([
      prisma.productView.count({ where: { productId: id } }),
      prisma.purchase.count({ where: { productId: id, status: 'COMPLETED' } }),
      prisma.purchase.aggregate({ where: { productId: id, status: 'COMPLETED' }, _sum: { pricePaid: true } }),
      prisma.review.aggregate({ where: { productId: id }, _avg: { rating: true } }),
      prisma.review.count({ where: { productId: id } }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        views,
        orders,
        revenue: revenue._sum.pricePaid || 0,
        customers: orders,
        rating: avgRating._avg.rating ? parseFloat(avgRating._avg.rating.toFixed(1)) : 0,
        reviewCount,
        conversionRate: views > 0 ? parseFloat(((orders / views) * 100).toFixed(2)) : 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProduct,
  getMyProducts,
  getPublicProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  trackView,
  getProductAnalytics,
};
