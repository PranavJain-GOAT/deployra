const bcrypt = require('bcrypt');
const axios = require('axios');
const crypto = require('crypto');
const { prisma } = require('../config/database');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { AppError } = require('../middleware/errorHandler');
const { sendWelcomeEmail, sendPasswordResetEmail } = require('../services/email.service');
const logger = require('../utils/logger');

// --- Helper Functions ---

/**
 * Configure and set secure JWT cookies on the response object.
 * Supports "Remember Me" functionality.
 */
const setAuthCookies = (res, accessToken, refreshToken, rememberMe = false) => {
  const isProd = process.env.NODE_ENV === 'production';
  
  // Access Token Cookie (short-lived, e.g. 15 minutes)
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 15 * 60 * 1000 // 15 minutes
  });

  // Refresh Token Cookie
  const refreshCookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax'
  };

  // If "Remember Me" is selected, persist cookie for 7 days.
  // Otherwise, omit maxAge to make it a browser session cookie (dies on browser close).
  if (rememberMe) {
    refreshCookieOptions.maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
  }

  res.cookie('refreshToken', refreshToken, refreshCookieOptions);
};

/**
 * Clear JWT cookies to securely end the session.
 */
const clearAuthCookies = (res) => {
  const isProd = process.env.NODE_ENV === 'production';
  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax'
  });
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax'
  });
};

// --- Controller Handlers ---

/**
 * Register a new manual Email/Password user.
 */
const register = async (req, res, next) => {
  try {
    const { email, password, name, role, firstName, lastName, country } = req.body;

    // Validate email is provided
    if (!email) {
      return next(new AppError('Email is required', 400));
    }

    // Password validation complexity check
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ 
        success: false, 
        message: "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character (@$!%*?&)." 
      });
    }

    // Prevent duplicate accounts
    const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existingUser) {
      return next(new AppError('Email already in use', 400));
    }

    // Hash password securely
    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = (role?.toUpperCase() === 'DEVELOPER') ? 'DEVELOPER' : 'CLIENT';

    // Create the user in the database
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name: name || `${firstName} ${lastName}`,
        firstName,
        lastName,
        country: country || "India",
        role: userRole,
        authProvider: 'email',
        lastLogin: new Date()
      }
    });

    // Generate credentials
    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);

    // Store JWTs in HTTP-Only cookies
    setAuthCookies(res, accessToken, refreshToken, false);

    // Send a welcoming message
    try {
      await sendWelcomeEmail(user.email, user.name);
    } catch (emailErr) {
      logger.error('Failed to send welcome email during signup:', emailErr);
    }

    res.status(201).json({
      success: true,
      data: { 
        user: { 
          id: user.id, 
          email: user.email, 
          name: user.name, 
          role: user.role,
          authProvider: user.authProvider,
          profileImage: user.profileImage
        } 
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Log in a user using Email/Password.
 */
const login = async (req, res, next) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    
    // Check user exists and is an email auth provider
    if (!user) {
      return next(new AppError('Invalid email or password', 401));
    }

    if (user.authProvider !== 'email' || !user.password) {
      return next(new AppError('This account is registered using Google OAuth. Please log in using Google.', 400));
    }

    // Verify hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(new AppError('Invalid email or password', 401));
    }

    // Update lastLogin timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);

    // Set secure HTTP-only cookies
    setAuthCookies(res, accessToken, refreshToken, !!rememberMe);

    res.status(200).json({
      success: true,
      data: { 
        user: { 
          id: user.id, 
          email: user.email, 
          name: user.name, 
          role: user.role,
          authProvider: user.authProvider,
          profileImage: user.profileImage
        } 
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh access and refresh JWTs securely via cookies.
 */
const refresh = async (req, res, next) => {
  try {
    // Attempt to read from cookies first, fallback to req.body
    let incomingRefreshToken = null;
    if (req.cookies && req.cookies.refreshToken) {
      incomingRefreshToken = req.cookies.refreshToken;
    } else if (req.body && req.body.refreshToken) {
      incomingRefreshToken = req.body.refreshToken;
    }

    if (!incomingRefreshToken) {
      return next(new AppError('Refresh token required', 401));
    }

    const decoded = verifyRefreshToken(incomingRefreshToken);
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

    if (!user) {
      return next(new AppError('User not found', 401));
    }

    const newAccessToken = generateAccessToken(user.id, user.role);
    const newRefreshToken = generateRefreshToken(user.id);

    // Re-set cookies. We assume if a request contains a valid token, we refresh it.
    // We check if the incoming refresh token has a long lifespan to preserve "Remember Me"
    const decodedExpiry = decoded.exp ? decoded.exp * 1000 : 0;
    const isLongLived = decodedExpiry - Date.now() > 24 * 60 * 60 * 1000; // longer than 1 day

    setAuthCookies(res, newAccessToken, newRefreshToken, isLongLived);

    res.status(200).json({
      success: true,
      data: { 
        accessToken: newAccessToken, 
        refreshToken: newRefreshToken, // for compatibility
        user: { id: user.id, email: user.email, name: user.name, role: user.role }
      }
    });
  } catch (error) {
    next(new AppError('Invalid or expired refresh token', 401));
  }
};

/**
 * Fetch current authenticated user.
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

/**
 * Handle user logout securely by clearing cookies.
 */
const logout = async (req, res, next) => {
  try {
    clearAuthCookies(res);
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Trigger Google OAuth Login Redirect.
 */
const googleLogin = (req, res) => {
  // Use env var, but fall back to the correct production URI if misconfigured
  const redirectUri = (process.env.GOOGLE_REDIRECT_URI || '').startsWith('https://deployra.onrender.com')
    ? process.env.GOOGLE_REDIRECT_URI
    : 'https://deployra.onrender.com/auth/google/callback';
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=profile%20email&access_type=offline&prompt=consent`;
  res.redirect(url);
};

/**
 * Handle Google OAuth Callback.
 * Links accounts or creates a new one, sets HTTP-only cookies, and redirects.
 */
const googleCallback = async (req, res, next) => {
  const code = req.query.code || req.body.code;

  if (!code) {
    return next(new AppError('No code provided', 400));
  }

  try {
    // Exchange authorization code for tokens
    // Use the same redirect_uri that was used to initiate the flow
    const redirectUri = (process.env.GOOGLE_REDIRECT_URI || '').startsWith('https://deployra.onrender.com')
      ? process.env.GOOGLE_REDIRECT_URI
      : 'https://deployra.onrender.com/auth/google/callback';
    const { data } = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    });

    const { access_token } = data;

    // Use access_token to fetch Google profile info
    const { data: profile } = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    // Check if user exists via googleId or email
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
      // User does not exist, automatically register them!
      user = await prisma.user.create({
        data: {
          email: profile.email.toLowerCase(),
          name: profile.name || `${profile.given_name} ${profile.family_name}`,
          firstName: profile.given_name,
          lastName: profile.family_name,
          googleId: profile.id,
          isEmailVerified: true,
          authProvider: 'google',
          profileImage: googlePicture,
          role: 'CLIENT', // Default onboarding role
          lastLogin: new Date()
        }
      });
    } else {
      // User exists. Update last login, google ID, and image if missing/new
      user = await prisma.user.update({
        where: { id: user.id },
        data: { 
          googleId: profile.id, 
          isEmailVerified: true,
          lastLogin: new Date(),
          profileImage: user.profileImage || googlePicture,
          // If they signed up via email before, we keep their email provider info, or update if desired.
          // Let's ensure authProvider is set correctly.
          authProvider: user.authProvider === 'email' ? 'email' : 'google'
        }
      });
    }

    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);

    // Store JWT credentials securely in HTTP-only cookies
    setAuthCookies(res, accessToken, refreshToken, true); // Keep OAuth users signed in

    // Resolve FRONTEND_URL safely — guard against the "FRONTEND_URL=..." prefix corruption bug
    const frontendUrl = (process.env.FRONTEND_URL || '').replace(/^FRONTEND_URL=/, '').trim() || 'https://deployra.vercel.app';

    // If it's a GET request (direct redirection callback from Google)
    if (req.method === 'GET') {
      return res.redirect(`${frontendUrl}/auth/google/callback?success=true`);
    }

    // If it's a POST request (JSON payload exchange from frontend)
    res.status(200).json({
      success: true,
      data: {
        user: { 
          id: user.id, 
          email: user.email, 
          name: user.name, 
          role: user.role,
          authProvider: user.authProvider,
          profileImage: user.profileImage
        },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    logger.error('Google Auth Error:', error.response?.data || error.message);
    if (req.method === 'GET') {
      const frontendUrl = (process.env.FRONTEND_URL || '').replace(/^FRONTEND_URL=/, '').trim() || 'https://deployra.vercel.app';
      return res.redirect(`${frontendUrl}/auth?error=google_auth_failed`);
    }
    next(new AppError('Google authentication failed', 401));
  }
};

/**
 * Handle password reset requests (Forgot Password).
 * Generates an high-entropy token, saves expiration, and triggers email.
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return next(new AppError('Please provide an email address', 400));
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    // Premium Security Measure: To prevent email-enumeration attacks, we do NOT tell the client
    // if the email exists. We always return a generic success message.
    if (!user || user.authProvider !== 'email') {
      logger.info(`Forgot password requested for non-existent or OAuth email: ${email}`);
      return res.status(200).json({
        success: true,
        message: 'If that email address is in our database, we will send a password reset link shortly.'
      });
    }

    // Generate high-entropy reset token (64 hex characters)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour validity

    // Update user record
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetExpires
      }
    });

    // Reset Link URL
    // Reset Link URL — guard against FRONTEND_URL env var corruption
    const safeFrontendUrl = (process.env.FRONTEND_URL || '').replace(/^FRONTEND_URL=/, '').trim() || 'https://deployra.vercel.app';
    const resetUrl = `${safeFrontendUrl}/auth?tab=reset&token=${resetToken}`;

    // Send the password reset email
    try {
      await sendPasswordResetEmail(user.email, user.firstName || user.name, resetUrl);
      logger.info(`Password reset email successfully queued for ${user.email}`);
    } catch (emailErr) {
      logger.error(`SMTP email sending failed for ${user.email}:`, emailErr);
    }

    // Frictionless Developer Mode testing helper
    if (process.env.NODE_ENV !== 'production') {
      console.log('\n========================================================================');
      console.log('🔑 [DEV ONLY] PASSWORD RESET LINK DETECTED:');
      console.log(resetUrl);
      console.log('========================================================================\n');
    }

    res.status(200).json({
      success: true,
      message: 'If that email address is in our database, we will send a password reset link shortly.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Confirm password reset using the token.
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return next(new AppError('Token and new password are required', 400));
    }

    // Validate new password complexity
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({ 
        success: false, 
        message: "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character (@$!%*?&)." 
      });
    }

    // Find user with active, non-expired token
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          gt: new Date()
        }
      }
    });

    if (!user) {
      return next(new AppError('Password reset token is invalid or has expired.', 400));
    }

    // Hash the new password securely
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user record and clear reset tokens
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null
      }
    });

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully. You can now log in.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  refresh,
  getMe,
  googleLogin,
  googleCallback,
  logout,
  forgotPassword,
  resetPassword
};
