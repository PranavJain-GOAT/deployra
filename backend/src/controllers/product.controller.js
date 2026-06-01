const { prisma } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

const getProducts = async (req, res, next) => {
  try {
    const { status, developerId, search } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (developerId) filter.developerId = developerId;
    if (search) {
      filter.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const products = await prisma.product.findMany({
      where: filter,
      include: { developer: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ success: true, count: products.length, data: products });
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        developer: { select: { name: true, email: true } },
        reviews: { include: { user: { select: { name: true } } }, orderBy: { createdAt: 'desc' } }
      }
    });

    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const { title, description, price, features, images } = req.body;
    
    // Create product as pending
    const product = await prisma.product.create({
      data: {
        title,
        description,
        price,
        features: features || [],
        images: images || [],
        developerId: req.user.id,
        status: 'PENDING'
      }
    });

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    if (product.developerId !== req.user.id && req.user.role !== 'ADMIN') {
      return next(new AppError('Not authorized to update this product', 403));
    }

    const updated = await prisma.product.update({
      where: { id },
      data: req.body
    });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    if (product.developerId !== req.user.id && req.user.role !== 'ADMIN') {
      return next(new AppError('Not authorized to delete this product', 403));
    }

    await prisma.product.delete({ where: { id } });

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
