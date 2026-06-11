const express = require('express');
const { authenticate, optionalAuthenticate, authorize } = require('../middleware/auth.middleware');
const {
  createProduct,
  getMyProducts,
  getPublicProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  trackView,
  getProductAnalytics,
} = require('../controllers/product.controller');
const { validate } = require('../middleware/validate');
const { productSchema, productUpdateSchema } = require('../utils/schemas');

const router = express.Router();

// ── Developer routes (authenticated) ─────────────────────────────────────────
// GET own products
router.get('/my', authenticate, authorize('DEVELOPER', 'ADMIN'), getMyProducts);

// ── Public routes ─────────────────────────────────────────────────────────────
// GET approved products for marketplace (no auth required)
router.get('/public', getPublicProducts);

// GET single product (auth optional — handled in controller for ownership check)
router.get('/:id', optionalAuthenticate, getProduct);

// POST track view
router.post('/:id/view', optionalAuthenticate, trackView);


// POST create product submission
router.post('/', authenticate, authorize('DEVELOPER', 'ADMIN'), validate(productSchema), createProduct);

// PATCH update own product
router.patch('/:id', authenticate, authorize('DEVELOPER', 'ADMIN'), validate(productUpdateSchema), updateProduct);

// DELETE own product
router.delete('/:id', authenticate, authorize('DEVELOPER', 'ADMIN'), deleteProduct);

// GET product analytics
router.get('/analytics/:id', authenticate, authorize('DEVELOPER', 'ADMIN'), getProductAnalytics);

module.exports = router;
