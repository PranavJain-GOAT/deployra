const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

/**
 * Production-grade rate limiting for authentication routes.
 * Follows OWASP recommendations to prevent brute-force, credential stuffing,
 * and DDoS attacks on sensitive endpoints.
 */

// Standard message factory for consistent error responses
const rateLimitMessage = (windowMinutes, max, action = 'requests') => ({
  success: false,
  message: `Too many ${action} from this IP. Please wait ${windowMinutes} minutes before trying again.`
});

/**
 * General auth route limiter.
 * Applied to all /auth/* endpoints.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 30,                    // 30 requests per window per IP
  standardHeaders: true,      // Return RateLimit-* headers (RFC 6585)
  legacyHeaders: false,
  message: rateLimitMessage(15, 30),
  handler: (req, res, next, options) => {
    logger.warn(`Rate limit hit on auth route: IP=${req.ip} Path=${req.path}`);
    res.status(429).json(options.message);
  }
});

/**
 * Strict login/signup limiter.
 * Prevents credential stuffing and brute-force login attacks.
 * Applied to POST /login and POST /register.
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 8,                     // Only 8 login attempts per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins against the limit
  message: rateLimitMessage(15, 8, 'login attempts'),
  handler: (req, res, next, options) => {
    logger.warn(`Login brute-force rate limit hit: IP=${req.ip} Email=${req.body?.email || 'unknown'}`);
    res.status(429).json(options.message);
  }
});

/**
 * Password reset limiter.
 * Prevents automated account enumeration via reset endpoint.
 * Applied to POST /forgot-password.
 */
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 hour
  max: 5,                     // 5 reset requests per hour per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitMessage(60, 5, 'password reset requests'),
  handler: (req, res, next, options) => {
    logger.warn(`Password reset rate limit hit: IP=${req.ip} Email=${req.body?.email || 'unknown'}`);
    res.status(429).json(options.message);
  }
});

/**
 * Email verification resend limiter.
 * Prevents spamming verification emails.
 */
const emailResendLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 hour
  max: 3,                     // 3 resends per hour per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitMessage(60, 3, 'verification email requests')
});

module.exports = {
  authLimiter,
  loginLimiter,
  passwordResetLimiter,
  emailResendLimiter
};
