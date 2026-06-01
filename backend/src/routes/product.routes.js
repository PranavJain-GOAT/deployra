const express = require('express');
const { getProducts, getProductById, createProduct, updateProduct, deleteProduct } = require('../controllers/product.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate');
const { productSchema } = require('../utils/schemas');

const router = express.Router();

router.route('/')
  .get(getProducts)
  .post(authenticate, authorize('DEVELOPER', 'ADMIN'), validate(productSchema), createProduct);

router.route('/:id')
  .get(getProductById)
  .patch(authenticate, authorize('DEVELOPER', 'ADMIN'), updateProduct)
  .delete(authenticate, authorize('DEVELOPER', 'ADMIN'), deleteProduct);

module.exports = router;
