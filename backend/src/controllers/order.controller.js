const { prisma } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

const createOrder = async (req, res, next) => {
  try {
    const { productId, details } = req.body;
    const product = await prisma.product.findUnique({ where: { id: productId } });

    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    const order = await prisma.order.create({
      data: {
        userId: req.user.id,
        productId,
        details
      }
    });

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

const getMyOrders = async (req, res, next) => {
  try {
    let orders;
    if (req.user.role === 'DEVELOPER') {
      orders = await prisma.order.findMany({
        where: {
          product: {
            developerId: req.user.id
          }
        },
        include: {
          product: true,
          user: { select: { id: true, name: true, email: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
    } else {
      orders = await prisma.order.findMany({
        where: { userId: req.user.id },
        include: {
          product: true,
          user: { select: { id: true, name: true, email: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
    }

    const formatted = orders.map(o => ({
      id: o.id,
      productId: o.productId,
      productTitle: o.product?.title || "Product",
      clientEmail: o.user?.email || "anonymous@example.com",
      amount: o.product?.price || 0,
      pricePaid: o.product?.price || 0,
      status: o.status || 'COMPLETED', // default to COMPLETED since payment succeeded
      details: o.details,
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
      product: o.product,
      user: o.user
    }));

    res.status(200).json({ success: true, count: formatted.length, data: formatted });
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: { product: true, user: { select: { name: true, email: true } } }
    });

    if (!order) {
      return next(new AppError('Order not found', 404));
    }

    if (order.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return next(new AppError('Not authorized to view this order', 403));
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById
};
