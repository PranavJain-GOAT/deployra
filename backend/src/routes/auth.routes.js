const express = require('express');
const {
  register,
  login,
  verify2FA,
  refresh,
  getMe,
  googleLogin,
  googleCallback,
  logout,
  logoutAll,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword
} = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate');
const { registerSchema, loginSchema } = require('../utils/schemas');
const {
  authLimiter,
  loginLimiter,
  passwordResetLimiter,
  emailResendLimiter
} = require('../middleware/rateLimiter');

const router = express.Router();

// ── Apply a broad rate limit to every /auth route ──────────────────────────
router.use(authLimiter);

// ── Core Auth ──────────────────────────────────────────────────────────────
router.post('/register', loginLimiter, validate(registerSchema), register);
router.post('/login',    loginLimiter, validate(loginSchema), login);
router.post('/verify-2fa', loginLimiter, verify2FA);
router.post('/refresh',  refresh);
router.post('/logout',   logout);
router.post('/logout-all', authenticate, logoutAll);
router.get('/me',        authenticate, getMe);

// ── Google OAuth ───────────────────────────────────────────────────────────
router.get('/google', loginLimiter, googleLogin);
router.route('/google/callback')
  .get(googleCallback)
  .post(googleCallback);

// ── Email Verification ─────────────────────────────────────────────────────
router.get('/verify-email', verifyEmail);
router.post('/resend-verification', authenticate, emailResendLimiter, resendVerificationEmail);

// ── Password Reset ─────────────────────────────────────────────────────────
router.post('/forgot-password', passwordResetLimiter, forgotPassword);
router.post('/reset-password',  resetPassword);

module.exports = router;
