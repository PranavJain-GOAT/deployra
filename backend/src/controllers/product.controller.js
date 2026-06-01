const { prisma } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

const getProducts = async (req, res, next) => {
  try {
    const { status, developerId, search, category, sortBy, page = 1, limit = 12 } = req.query;
    const filter = {};

    if (status) {
      filter.status = status;
    } else {
      filter.status = 'APPROVED';
    }

    if (developerId) filter.developerId = developerId;
    if (category) filter.category = category;
    
    if (search) {
      filter.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { whatItDoes: { contains: search, mode: 'insensitive' } }
      ];
    }

    let orderBy = { createdAt: 'desc' };
    if (sortBy === 'price-asc') {
      orderBy = { price: 'asc' };
    } else if (sortBy === 'price-desc') {
      orderBy = { price: 'desc' };
    } else if (sortBy === 'views') {
      orderBy = { views: 'desc' };
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: filter,
        include: { 
          developer: { select: { name: true, profileImage: true } },
          reviews: { select: { rating: true } }
        },
        orderBy,
        skip,
        take: limitNum
      }),
      prisma.product.count({ where: filter })
    ]);

    const formattedProducts = products.map(p => {
      const reviewCount = p.reviews.length;
      const avgRating = reviewCount > 0 
        ? p.reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount 
        : 0;
      return {
        ...p,
        rating: avgRating,
        reviewCount
      };
    });

    res.status(200).json({ 
      success: true, 
      count: formattedProducts.length, 
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: formattedProducts 
    });
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
        developer: { select: { name: true, email: true, profileImage: true } },
        reviews: { include: { user: { select: { name: true, profileImage: true } } }, orderBy: { createdAt: 'desc' } }
      }
    });

    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    const reviewCount = product.reviews.length;
    const avgRating = reviewCount > 0 
      ? product.reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount 
      : 0;

    res.status(200).json({ 
      success: true, 
      data: {
        ...product,
        rating: avgRating,
        reviewCount
      } 
    });
  } catch (error) {
    next(error);
  }
};

const getMyProducts = async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      where: { developerId: req.user.id },
      include: {
        _count: {
          select: { purchases: true, reviews: true }
        },
        reviews: {
          select: { rating: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = products.map(p => {
      const reviewCount = p._count.reviews;
      const avgRating = reviewCount > 0
        ? p.reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount
        : 0;
      return {
        id: p.id,
        title: p.title,
        price: p.price,
        status: p.status,
        views: p.views,
        demoViews: p.demoViews,
        createdAt: p.createdAt,
        salesCount: p._count.purchases,
        rating: avgRating,
        reviewCount
      };
    });

    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const {
      title,
      description,
      price,
      features,
      images,
      category,
      demoUrl,
      videoUrl,
      whatItDoes,
      whoItsFor,
      whatsIncluded,
      whatsNotIncluded,
      setupTime,
      deliveryDays
    } = req.body;
    
    const product = await prisma.product.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        features: features || [],
        images: images || [],
        category,
        demoUrl,
        videoUrl,
        whatItDoes,
        whoItsFor: whoItsFor || [],
        whatsIncluded: whatsIncluded || [],
        whatsNotIncluded: whatsNotIncluded || [],
        setupTime,
        deliveryDays: deliveryDays ? parseInt(deliveryDays) : 5,
        developerId: req.user.id,
        status: 'PENDING'
      }
    });

    // Track activity
    await prisma.activity.create({
      data: {
        userId: req.user.id,
        type: 'PRODUCT_PUBLISHED',
        title: 'Product Published',
        body: `Your product "${product.title}" has been submitted for review.`,
        meta: JSON.stringify({ productId: product.id })
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

    const data = { ...req.body };
    if (data.price !== undefined) data.price = parseFloat(data.price);
    if (data.deliveryDays !== undefined) data.deliveryDays = parseInt(data.deliveryDays);

    const updated = await prisma.product.update({
      where: { id },
      data
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

const incrementViews = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.product.update({
      where: { id },
      data: { views: { increment: 1 } }
    });
    res.status(200).json({ success: true, message: 'Views incremented' });
  } catch (error) {
    next(error);
  }
};

const incrementDemoViews = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.product.update({
      where: { id },
      data: { demoViews: { increment: 1 } }
    });
    res.status(200).json({ success: true, message: 'Demo views incremented' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  getMyProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  incrementViews,
  incrementDemoViews
};
