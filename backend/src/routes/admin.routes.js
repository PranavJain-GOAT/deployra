const express = require('express');
const { authenticate, adminOnly } = require('../middleware/auth.middleware');
const {
  getStats,
  getAllProducts,
  approveProduct,
  rejectProduct,
  suspendProduct,
  getAuditLogs,
} = require('../controllers/admin.controller');

const router = express.Router();

// All admin routes require authentication + ADMIN role
router.use(authenticate, adminOnly);

router.get('/stats', getStats);
router.get('/products', getAllProducts);
router.patch('/products/:id/approve', approveProduct);
router.patch('/products/:id/reject', rejectProduct);
router.patch('/products/:id/suspend', suspendProduct);
router.get('/audit-logs', getAuditLogs);

module.exports = router;
