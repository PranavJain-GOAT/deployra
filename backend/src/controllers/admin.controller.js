const { prisma } = require('../config/database');
const {
  sendProductApprovedEmail,
  sendProductRejectedEmail,
} = require('../services/email.service');
const logger = require('../utils/logger');

// ─── GET /admin/stats ─ Platform-wide statistics ──────────────────────────────
const getStats = async (req, res, next) => {
  try {
    const [
      pendingCount,
      approvedCount,
      rejectedCount,
      totalProducts,
      totalDevelopers,
      totalUsers,
      totalRevenue,
    ] = await Promise.all([
      prisma.product.count({ where: { status: 'PENDING_REVIEW' } }),
      prisma.product.count({ where: { status: 'APPROVED' } }),
      prisma.product.count({ where: { status: 'REJECTED' } }),
      prisma.product.count(),
      prisma.user.count({ where: { role: 'DEVELOPER' } }),
      prisma.user.count({ where: { role: { in: ['CLIENT', 'DEVELOPER'] } } }),
      prisma.purchase.aggregate({ where: { status: 'COMPLETED' }, _sum: { pricePaid: true } }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        pendingCount,
        approvedCount,
        rejectedCount,
        totalProducts,
        totalDevelopers,
        totalUsers,
        totalRevenue: totalRevenue._sum.pricePaid || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /admin/products ─ All products with optional status filter ────────────
const getAllProducts = async (req, res, next) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;

    const where = status ? { status } : {};

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit, 10),
      skip: parseInt(offset, 10),
      include: {
        developer: {
          select: { id: true, name: true, email: true, profileImage: true, createdAt: true },
        },
        _count: { select: { purchases: true, reviews: true, views: true } },
      },
    });

    const enriched = products.map(p => ({
      ...p,
      configFields: p.configSchema ? (() => { try { return JSON.parse(p.configSchema); } catch { return []; } })() : [],
      orders: p._count.purchases,
      views: p._count.views,
      reviewCount: p._count.reviews,
    }));

    return res.status(200).json({ success: true, data: enriched });
  } catch (error) {
    next(error);
  }
};

// ─── PATCH /admin/products/:id/approve ─ Approve a product ───────────────────
const approveProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: { developer: { select: { id: true, name: true, email: true } } },
    });

    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    if (product.status === 'APPROVED') return res.status(400).json({ success: false, message: 'Product is already approved.' });

    const updated = await prisma.product.update({
      where: { id },
      data: {
        status: 'APPROVED',
        rejectionReason: null,
        reviewedAt: new Date(),
        reviewedBy: req.user.id,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: 'PRODUCT_APPROVED',
        actorId: req.user.id,
        targetId: id,
        targetType: 'PRODUCT',
        metadata: JSON.stringify({ productTitle: product.title, developerEmail: product.developer.email }),
      },
    }).catch(err => logger.error('Audit log failed:', err.message));

    // Notify developer
    if (product.developer?.email) {
      sendProductApprovedEmail(product.developer.email, product.developer.name, product.title).catch(err => {
        logger.error('Approval email failed:', err.message);
      });
    }

    return res.status(200).json({
      success: true,
      message: `"${product.title}" has been approved and is now live on the marketplace.`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// ─── PATCH /admin/products/:id/reject ─ Reject a product ─────────────────────
const rejectProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({ success: false, message: 'A rejection reason is required.' });
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: { developer: { select: { id: true, name: true, email: true } } },
    });

    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

    const updated = await prisma.product.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectionReason: reason.trim(),
        reviewedAt: new Date(),
        reviewedBy: req.user.id,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: 'PRODUCT_REJECTED',
        actorId: req.user.id,
        targetId: id,
        targetType: 'PRODUCT',
        metadata: JSON.stringify({ productTitle: product.title, reason: reason.trim(), developerEmail: product.developer.email }),
      },
    }).catch(err => logger.error('Audit log failed:', err.message));

    // Notify developer
    if (product.developer?.email) {
      sendProductRejectedEmail(product.developer.email, product.developer.name, product.title, reason.trim()).catch(err => {
        logger.error('Rejection email failed:', err.message);
      });
    }

    return res.status(200).json({
      success: true,
      message: `"${product.title}" has been rejected. The developer has been notified.`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// ─── PATCH /admin/products/:id/suspend ─ Suspend an approved product ──────────
const suspendProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

    const updated = await prisma.product.update({
      where: { id },
      data: {
        status: 'SUSPENDED',
        rejectionReason: reason || 'Suspended by admin',
        reviewedAt: new Date(),
        reviewedBy: req.user.id,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'PRODUCT_SUSPENDED',
        actorId: req.user.id,
        targetId: id,
        targetType: 'PRODUCT',
        metadata: JSON.stringify({ reason }),
      },
    }).catch(() => {});

    return res.status(200).json({ success: true, message: 'Product suspended.', data: updated });
  } catch (error) {
    next(error);
  }
};

// ─── GET /admin/audit-logs ─ Recent audit logs ────────────────────────────────
const getAuditLogs = async (req, res, next) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return res.status(200).json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats,
  getAllProducts,
  approveProduct,
  rejectProduct,
  suspendProduct,
  getAuditLogs,
};
