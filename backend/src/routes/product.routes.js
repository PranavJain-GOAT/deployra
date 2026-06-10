const express = require('express');
const { authenticate, authorize, adminOnly } = require('../middleware/auth.middleware');
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
router.get('/:id', (req, res, next) => {
  // Optionally authenticate, but don't require it
  authenticate(req, res, () => {
    getProduct(req, res, next);
  });
});

// POST track view
router.post('/:id/view', (req, res, next) => {
  authenticate(req, res, () => {
    trackView(req, res, next);
  });
});

// POST create product submission
router.post('/', authenticate, authorize('DEVELOPER', 'ADMIN'), validate(productSchema), createProduct);

// PATCH update own product
router.patch('/:id', authenticate, authorize('DEVELOPER', 'ADMIN'), validate(productUpdateSchema), updateProduct);

// DELETE own product
router.delete('/:id', authenticate, authorize('DEVELOPER', 'ADMIN'), deleteProduct);

// GET product analytics
router.get('/analytics/:id', authenticate, authorize('DEVELOPER', 'ADMIN'), getProductAnalytics);

module.exports = router;
