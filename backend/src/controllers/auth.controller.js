const bcrypt = require('bcrypt');
const axios = require('axios');
const crypto = require('crypto');
const { prisma } = require('../config/database');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { AppError } = require('../middleware/errorHandler');
const {
  sendWelcomeEmail,
  sendEmailVerificationEmail,
  sendPasswordResetEmail,
  sendPasswordChangedEmail
} = require('../services/email.service');
const logger = require('../utils/logger');

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 30 * 60 * 1000; // 30 minutes
const BCRYPT_SALT_ROUNDS = 12;

// Password complexity: 8+ chars, upper + lower + digit + special char
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
const PASSWORD_RULE_MSG =
  'Password must be 8+ characters and include an uppercase letter, a lowercase letter, a number, and a special character (@$!%*?&).';

// ─── Helper Utilities ─────────────────────────────────────────────────────────

/**
 * Compute a SHA-256 hash of a refresh token for safe database storage.
 * Never store raw refresh tokens in the database.
 */
const hashToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

/**
 * Set secure HTTP-only JWT cookies on the response.
 */
const setAuthCookies = (res, accessToken, refreshToken, rememberMe = false) => {
  const isProd = process.env.NODE_ENV === 'production' ||
                 (process.env.FRONTEND_URL || '').includes('vercel.app') ||
                 (process.env.GOOGLE_REDIRECT_URI || '').includes('onrender.com');

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 15 * 60 * 1000 // 15 minutes
  });

  const refreshCookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax'
  };

  if (rememberMe) {
    refreshCookieOptions.maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
  }

  res.cookie('refreshToken', refreshToken, refreshCookieOptions);
};

/**
 * Clear JWT cookies to securely end the session.
 */
const clearAuthCookies = (res) => {
  const isProd = process.env.NODE_ENV === 'production' ||
                 (process.env.FRONTEND_URL || '').includes('vercel.app') ||
                 (process.env.GOOGLE_REDIRECT_URI || '').includes('onrender.com');
  const opts = { httpOnly: true, secure: isProd, sameSite: isProd ? 'none' : 'lax' };
  res.clearCookie('accessToken', opts);
  res.clearCookie('refreshToken', opts);
};

/**
 * Safely read the frontend base URL (guards against env var corruption).
 */
const getFrontendUrl = () =>
  (process.env.FRONTEND_URL || '').replace(/^FRONTEND_URL=/, '').trim() ||
  'https://deployra.vercel.app';

/**
 * Store a hashed refresh token in the database for session tracking.
 */
const storeRefreshToken = async (userId, rawToken, req) => {
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
      userAgent: req?.headers?.['user-agent'] || null,
      ipAddress: req?.ip || req?.headers?.['x-forwarded-for'] || null
    }
  });
};

/**
 * Record a login attempt in the audit log.
 */
const recordLoginHistory = async (userId, req, success, failReason = null) => {
  try {
    await prisma.loginHistory.create({
      data: {
        userId,
        ipAddress: req?.ip || req?.headers?.['x-forwarded-for'] || null,
        userAgent: req?.headers?.['user-agent'] || null,
        success,
        failReason
      }
    });
  } catch (e) {
    logger.error('Failed to record login history:', e.message);
  }
};

// ─── Register ─────────────────────────────────────────────────────────────────

/**
 * Register a new user with email + password.
 * Sends a welcome email and an email verification link.
 */
const register = async (req, res, next) => {
  try {
    const { email, password, name, role, firstName, lastName, country } = req.body;

    if (!email) return next(new AppError('Email is required', 400));

    if (!PASSWORD_REGEX.test(password)) {
      return res.status(400).json({ success: false, message: PASSWORD_RULE_MSG });
    }

    const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existingUser) return next(new AppError('An account with this email already exists.', 400));

    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
    const userRole = role?.toUpperCase() === 'DEVELOPER' ? 'DEVELOPER' : 'CLIENT';

    // Generate email verification token
    const emailVerifyToken = crypto.randomBytes(32).toString('hex');
    const emailVerifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name: name || `${firstName || ''} ${lastName || ''}`.trim(),
        firstName: firstName || null,
        lastName: lastName || null,
        country: country || 'India',
        role: userRole,
        authProvider: 'email',
        lastLogin: new Date(),
        emailVerifyToken,
        emailVerifyExpires
      }
    });

    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);

    setAuthCookies(res, accessToken, refreshToken, false);
    await storeRefreshToken(user.id, refreshToken, req);

    // Fire emails asynchronously — don't block the response
    const verifyUrl = `${getFrontendUrl()}/auth/verify-email?token=${emailVerifyToken}`;
    Promise.allSettled([
      sendWelcomeEmail(user.email, user.name),
      sendEmailVerificationEmail(user.email, user.name, verifyUrl)
    ]).then(results => {
      results.forEach((r, i) => {
        if (r.status === 'rejected') logger.error(`Email ${i} failed for ${user.email}:`, r.reason);
      });
    });

    logger.info(`New user registered: ${user.email} (${user.role})`);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          authProvider: user.authProvider,
          profileImage: user.profileImage,
          isEmailVerified: user.isEmailVerified
        },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    next(error);
  }
};

// ─── Login ────────────────────────────────────────────────────────────────────

/**
 * Authenticate a user with email + password.
 * Implements account lockout after MAX_FAILED_ATTEMPTS failures.
 */
const login = async (req, res, next) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    // If no user, return a generic error (prevent user enumeration)
    if (!user) {
      return next(new AppError('Invalid email or password', 401));
    }

    // ── Account Lockout Check ──
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const remainingMs = user.lockedUntil - new Date();
      const remainingMins = Math.ceil(remainingMs / 60000);
      return res.status(423).json({
        success: false,
        message: `Account temporarily locked due to too many failed login attempts. Try again in ${remainingMins} minute${remainingMins > 1 ? 's' : ''}.`
      });
    }

    if (user.authProvider !== 'email' || !user.password) {
      return next(new AppError('This account uses Google sign-in. Please use the "Continue with Google" button.', 400));
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      // Increment failed attempt counter
      const newFailedCount = (user.failedLoginAttempts || 0) + 1;
      const shouldLock = newFailedCount >= MAX_FAILED_ATTEMPTS;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: newFailedCount,
          lockedUntil: shouldLock ? new Date(Date.now() + LOCKOUT_DURATION_MS) : null
        }
      });

      await recordLoginHistory(user.id, req, false, 'invalid_password');

      if (shouldLock) {
        logger.warn(`Account locked for 30 minutes: ${user.email} (${newFailedCount} failed attempts)`);
        return res.status(423).json({
          success: false,
          message: `Too many failed login attempts. Your account has been temporarily locked for 30 minutes.`
        });
      }

      const attemptsLeft = MAX_FAILED_ATTEMPTS - newFailedCount;
      return res.status(401).json({
        success: false,
        message: `Invalid email or password. ${attemptsLeft} attempt${attemptsLeft !== 1 ? 's' : ''} remaining before your account is locked.`
      });
    }

    // ── Successful Login ──
    // Reset lockout counters on success
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLogin: new Date(),
        failedLoginAttempts: 0,
        lockedUntil: null
      }
    });

    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);

    setAuthCookies(res, accessToken, refreshToken, !!rememberMe);
    await storeRefreshToken(user.id, refreshToken, req);
    await recordLoginHistory(user.id, req, true);

    logger.info(`User logged in: ${user.email}`);

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          authProvider: user.authProvider,
          profileImage: user.profileImage,
          isEmailVerified: user.isEmailVerified
        },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    next(error);
  }
};

// ─── Token Refresh ────────────────────────────────────────────────────────────

/**
 * Silently rotate access + refresh tokens.
 * Validates the token exists in DB and has not been revoked.
 */
const refresh = async (req, res, next) => {
  try {
    const incomingRefreshToken =
      req.cookies?.refreshToken || req.body?.refreshToken;

    if (!incomingRefreshToken) {
      return next(new AppError('Refresh token required', 401));
    }

    const decoded = verifyRefreshToken(incomingRefreshToken);

    // Validate against DB — reject revoked/missing tokens
    const tokenHash = hashToken(incomingRefreshToken);
    const storedToken = await prisma.refreshToken.findUnique({ where: { tokenHash } });

    if (!storedToken || storedToken.revoked || storedToken.expiresAt < new Date()) {
      return next(new AppError('Session expired. Please log in again.', 401));
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) return next(new AppError('User not found', 401));

    // Revoke the old token (token rotation — one-time use)
    await prisma.refreshToken.update({
      where: { tokenHash },
      data: { revoked: true }
    });

    const newAccessToken = generateAccessToken(user.id, user.role);
    const newRefreshToken = generateRefreshToken(user.id);

    // Check if original token was long-lived (remember me)
    const isLongLived = (decoded.exp * 1000 - Date.now()) > 24 * 60 * 60 * 1000;
    setAuthCookies(res, newAccessToken, newRefreshToken, isLongLived);
    await storeRefreshToken(user.id, newRefreshToken, req);

    res.status(200).json({
      success: true,
      data: {
        user: { id: user.id, email: user.email, name: user.name, role: user.role, isEmailVerified: user.isEmailVerified },
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    next(new AppError('Invalid or expired session. Please log in again.', 401));
  }
};

// ─── Get Me ───────────────────────────────────────────────────────────────────

/**
 * Return the currently authenticated user profile.
 */
const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isEmailVerified: true,
        authProvider: true,
        profileImage: true,
        firstName: true,
        lastName: true,
        country: true,
        createdAt: true
      }
    });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// ─── Logout ───────────────────────────────────────────────────────────────────

/**
 * Log out the current session by revoking the refresh token and clearing cookies.
 */
const logout = async (req, res, next) => {
  try {
    const rawRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (rawRefreshToken) {
      const tokenHash = hashToken(rawRefreshToken);
      await prisma.refreshToken.updateMany({
        where: { tokenHash, revoked: false },
        data: { revoked: true }
      }).catch(() => {}); // Soft fail — still clear cookies
    }

    clearAuthCookies(res);
    res.status(200).json({ success: true, message: 'Logged out successfully.' });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout from ALL devices by revoking every refresh token for this user.
 */
const logoutAll = async (req, res, next) => {
  try {
    await prisma.refreshToken.updateMany({
      where: { userId: req.user.id, revoked: false },
      data: { revoked: true }
    });

    clearAuthCookies(res);
    logger.info(`All sessions revoked for user: ${req.user.email}`);
    res.status(200).json({ success: true, message: 'Logged out from all devices.' });
  } catch (error) {
    next(error);
  }
};

// ─── Email Verification ───────────────────────────────────────────────────────

/**
 * Verify a user's email using the one-time token sent during registration.
 */
const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;

    if (!token) return next(new AppError('Verification token is required', 400));

    const user = await prisma.user.findFirst({
      where: {
        emailVerifyToken: token,
        emailVerifyExpires: { gt: new Date() }
      }
    });

    if (!user) {
      return next(new AppError('Email verification token is invalid or has expired.', 400));
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerifyToken: null,
        emailVerifyExpires: null
      }
    });

    logger.info(`Email verified for user: ${user.email}`);
    res.status(200).json({ success: true, message: 'Email verified successfully. You can now use all features.' });
  } catch (error) {
    next(error);
  }
};

/**
 * Resend the email verification link.
 */
const resendVerificationEmail = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    if (user.isEmailVerified) {
      return res.status(400).json({ success: false, message: 'Your email is already verified.' });
    }

    const emailVerifyToken = crypto.randomBytes(32).toString('hex');
    const emailVerifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerifyToken, emailVerifyExpires }
    });

    const verifyUrl = `${getFrontendUrl()}/auth/verify-email?token=${emailVerifyToken}`;

    try {
      await sendEmailVerificationEmail(user.email, user.name, verifyUrl);
    } catch (emailErr) {
      logger.error('Failed to resend verification email:', emailErr);
    }

    res.status(200).json({ success: true, message: 'Verification email sent. Please check your inbox.' });
  } catch (error) {
    next(error);
  }
};

// ─── Google OAuth ─────────────────────────────────────────────────────────────

/**
 * Initiate Google OAuth — redirect browser to Google's consent screen.
 */
const googleLogin = (req, res) => {
  const redirectUri = (process.env.GOOGLE_REDIRECT_URI || '').startsWith('https://deployra.onrender.com')
    ? process.env.GOOGLE_REDIRECT_URI
    : 'https://deployra.onrender.com/auth/google/callback';

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'profile email',
    access_type: 'offline',
    prompt: 'consent'
  });

  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
};

/**
 * Handle the Google OAuth callback.
 * Links Google accounts to existing email accounts or creates a new user.
 */
const googleCallback = async (req, res, next) => {
  const code = req.query.code || req.body.code;

  if (!code) return next(new AppError('No authorization code provided', 400));

  try {
    const redirectUri = (process.env.GOOGLE_REDIRECT_URI || '').startsWith('https://deployra.onrender.com')
      ? process.env.GOOGLE_REDIRECT_URI
      : 'https://deployra.onrender.com/auth/google/callback';

    // Exchange authorization code for access token
    const { data } = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code'
    });

    const { access_token } = data;

    // Fetch Google profile info
    const { data: profile } = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    // Find existing user by Google ID or email
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { googleId: profile.id },
          { email: profile.email.toLowerCase() }
        ]
      }
    });

    const googlePicture = profile.picture || null;

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: profile.email.toLowerCase(),
          name: profile.name || `${profile.given_name} ${profile.family_name}`,
          firstName: profile.given_name,
          lastName: profile.family_name,
          googleId: profile.id,
          isEmailVerified: true, // Google accounts are pre-verified
          authProvider: 'google',
          profileImage: googlePicture,
          role: 'CLIENT',
          lastLogin: new Date()
        }
      });
      // Send welcome email to new Google users
      sendWelcomeEmail(user.email, user.name).catch(err =>
        logger.error('Welcome email failed for Google user:', err)
      );
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: profile.id,
          isEmailVerified: true,
          lastLogin: new Date(),
          profileImage: user.profileImage || googlePicture,
          authProvider: user.authProvider === 'email' ? 'email' : 'google'
        }
      });
    }

    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);

    setAuthCookies(res, accessToken, refreshToken, true);
    await storeRefreshToken(user.id, refreshToken, req);
    await recordLoginHistory(user.id, req, true);

    const frontendUrl = getFrontendUrl();

    if (req.method === 'GET') {
      // Encode a minimal user payload in the redirect URL so the frontend
      // can hydrate auth state without requiring a cross-origin cookie read.
      // This is the same approach used by Supabase, Auth0, and NextAuth.
      const userPayload = Buffer.from(JSON.stringify({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        authProvider: user.authProvider,
        profileImage: user.profileImage,
        isEmailVerified: user.isEmailVerified,
      })).toString('base64url');

      return res.redirect(
        `${frontendUrl}/auth/google/callback?success=true&u=${userPayload}&token=${accessToken}&refreshToken=${refreshToken}`
      );
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          authProvider: user.authProvider,
          profileImage: user.profileImage,
          isEmailVerified: user.isEmailVerified
        }
      }
    });
  } catch (error) {
    logger.error('Google Auth Error:', error.response?.data || error.message);
    if (req.method === 'GET') {
      return res.redirect(`${getFrontendUrl()}/auth?error=google_auth_failed`);
    }
    next(new AppError('Google authentication failed', 401));
  }
};

// ─── Forgot Password ──────────────────────────────────────────────────────────

/**
 * Initiate the forgot-password flow.
 * Always returns a generic success message to prevent email enumeration attacks.
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) return next(new AppError('Please provide an email address', 400));

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    const GENERIC_RESPONSE = {
      success: true,
      message: 'If that email address is in our database, we will send a password reset link shortly.'
    };

    if (!user || user.authProvider !== 'email') {
      logger.info(`Forgot password: no email-auth user found for: ${email}`);
      return res.status(200).json(GENERIC_RESPONSE);
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: { resetPasswordToken: resetToken, resetPasswordExpires: resetExpires }
    });

    const resetUrl = `${getFrontendUrl()}/auth?tab=reset&token=${resetToken}`;

    try {
      await sendPasswordResetEmail(user.email, user.firstName || user.name, resetUrl);
      logger.info(`Password reset email sent to ${user.email}`);
    } catch (emailErr) {
      logger.error(`Password reset email failed for ${user.email}:`, emailErr);
    }

    // DEV: log the reset URL to the console for easy testing
    if (process.env.NODE_ENV !== 'production') {
      console.log('\n════════════════════════════════════════════');
      console.log('🔑 [DEV ONLY] PASSWORD RESET LINK:');
      console.log(resetUrl);
      console.log('════════════════════════════════════════════\n');
    }

    res.status(200).json(GENERIC_RESPONSE);
  } catch (error) {
    next(error);
  }
};

// ─── Reset Password ───────────────────────────────────────────────────────────

/**
 * Complete the password reset using a valid, non-expired token.
 * Sends a security confirmation email after success.
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return next(new AppError('Token and new password are required', 400));
    }

    if (!PASSWORD_REGEX.test(newPassword)) {
      return res.status(400).json({ success: false, message: PASSWORD_RULE_MSG });
    }

    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { gt: new Date() }
      }
    });

    if (!user) {
      return next(new AppError('Password reset token is invalid or has expired.', 400));
    }

    const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
        failedLoginAttempts: 0, // Clear lockout on password reset
        lockedUntil: null
      }
    });

    // Revoke all sessions — force re-login after password change
    await prisma.refreshToken.updateMany({
      where: { userId: user.id, revoked: false },
      data: { revoked: true }
    });

    // Send security confirmation email
    const ipAddress = req.ip || req.headers?.['x-forwarded-for'] || 'Unknown';
    sendPasswordChangedEmail(user.email, user.firstName || user.name, ipAddress)
      .catch(err => logger.error('Password changed email failed:', err));

    logger.info(`Password reset completed for: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully. Please log in with your new password.'
    });
  } catch (error) {
    next(error);
  }
};

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
  register,
  login,
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
};
