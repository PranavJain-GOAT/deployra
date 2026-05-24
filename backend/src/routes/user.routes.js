const express = require('express');
const { authenticate } = require('../middleware/auth.middleware');
const { prisma } = require('../config/database');

const router = express.Router();

// ── GET /users/me ────────────────────────────────────────────────────────────
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        country: true,
        isEmailVerified: true,
        profileImage: true,
        authProvider: true,
        twoFactorEnabled: true,
        createdAt: true,
        lastLogin: true
      }
    });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
});

// ── GET /users/profile ───────────────────────────────────────────────────────
router.get('/profile', authenticate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        country: true,
        isEmailVerified: true,
        profileImage: true,
        authProvider: true,
        twoFactorEnabled: true,
        createdAt: true,
        lastLogin: true
      }
    });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
});

// ── PATCH /users/me ──────────────────────────────────────────────────────────
// Update profile: name, firstName, lastName, country, profileImage
router.patch('/me', authenticate, async (req, res, next) => {
  try {
    const { name, firstName, lastName, country, profileImage } = req.body;

    // Build update payload — only include fields that were sent
    const updateData = {};
    if (name !== undefined)         updateData.name = name.trim();
    if (firstName !== undefined)    updateData.firstName = firstName.trim();
    if (lastName !== undefined)     updateData.lastName = lastName.trim();
    if (country !== undefined)      updateData.country = country.trim();
    if (profileImage !== undefined) updateData.profileImage = profileImage;

    // Derive name from first/last if name not explicitly provided
    if (!updateData.name && (updateData.firstName || updateData.lastName)) {
      const current = await prisma.user.findUnique({ where: { id: req.user.id }, select: { firstName: true, lastName: true } });
      const fn = updateData.firstName || current.firstName || '';
      const ln = updateData.lastName  || current.lastName  || '';
      updateData.name = `${fn} ${ln}`.trim();
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ success: false, message: 'No fields provided to update.' });
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        country: true,
        isEmailVerified: true,
        profileImage: true,
        authProvider: true,
        twoFactorEnabled: true,
        createdAt: true
      }
    });

    res.status(200).json({ success: true, data: user, message: 'Profile updated successfully.' });
  } catch (error) {
    next(error);
  }
});

// ── DELETE /users/me/avatar ──────────────────────────────────────────────────
// Remove profile picture (sets profileImage to null)
router.delete('/me/avatar', authenticate, async (req, res, next) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { profileImage: null },
      select: { id: true, profileImage: true, twoFactorEnabled: true }
    });
    res.status(200).json({ success: true, data: user, message: 'Avatar removed successfully.' });
  } catch (error) {
    next(error);
  }
});

// ── Sessions & Devices ───────────────────────────────────────────────────────
router.get('/sessions', authenticate, async (req, res, next) => {
  try {
    const sessions = await prisma.refreshToken.findMany({
      where: { userId: req.user.id, revoked: false, expiresAt: { gt: new Date() } },
      select: {
        id: true,
        userAgent: true,
        ipAddress: true,
        createdAt: true,
        expiresAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ success: true, data: sessions });
  } catch (error) {
    next(error);
  }
});

router.delete('/sessions/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const session = await prisma.refreshToken.findFirst({
      where: { id, userId: req.user.id }
    });
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found or unauthorized.' });
    }
    await prisma.refreshToken.delete({ where: { id } });
    res.status(200).json({ success: true, message: 'Session revoked successfully.' });
  } catch (error) {
    next(error);
  }
});

// ── Login Audit Logs ─────────────────────────────────────────────────────────
router.get('/login-history', authenticate, async (req, res, next) => {
  try {
    const history = await prisma.loginHistory.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    res.status(200).json({ success: true, data: history });
  } catch (error) {
    next(error);
  }
});

// ── Password Update ──────────────────────────────────────────────────────────
const bcrypt = require('bcrypt');
router.post('/change-password', authenticate, async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'New password must be at least 8 characters long.' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.authProvider !== 'email') {
      return res.status(400).json({ success: false, message: 'Password change is only supported for email auth accounts.' });
    }

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password does not match.' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword }
    });

    res.status(200).json({ success: true, message: 'Password updated successfully.' });
  } catch (error) {
    next(error);
  }
});

// ── Two-Factor Authentication ────────────────────────────────────────────────
const crypto = require('crypto');
const { verifyTOTP, generateBase32Secret } = require('../utils/totp');

router.post('/2fa/setup', authenticate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const secret = generateBase32Secret(16);
    const label = `Deployra:${user.email}`;
    const otpauthUrl = `otpauth://totp/${encodeURIComponent(label)}?secret=${secret}&issuer=Deployra`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauthUrl)}`;

    res.status(200).json({
      success: true,
      data: {
        secret,
        qrCodeUrl,
        otpauthUrl
      }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/2fa/enable', authenticate, async (req, res, next) => {
  try {
    const { token, secret } = req.body;
    if (!token || !secret) {
      return res.status(400).json({ success: false, message: 'Token and secret are required.' });
    }

    const isValid = verifyTOTP(token, secret);
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid 2FA code.' });
    }

    const recoveryCodes = Array.from({ length: 10 }, () =>
      crypto.randomBytes(4).toString('hex').toUpperCase()
    );

    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        twoFactorSecret: secret,
        twoFactorEnabled: true,
        twoFactorRecoveryCodes: recoveryCodes.join(',')
      }
    });

    res.status(200).json({
      success: true,
      message: 'Two-Factor Authentication enabled successfully.',
      data: { recoveryCodes }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/2fa/disable', authenticate, async (req, res, next) => {
  try {
    const { token } = req.body;
    
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
      return res.status(400).json({ success: false, message: '2FA is not enabled.' });
    }

    const isValid = verifyTOTP(token, user.twoFactorSecret);
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid 2FA verification code.' });
    }

    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        twoFactorSecret: null,
        twoFactorEnabled: false,
        twoFactorRecoveryCodes: null
      }
    });

    res.status(200).json({ success: true, message: 'Two-Factor Authentication disabled successfully.' });
  } catch (error) {
    next(error);
  }
});

// ── GDPR Export & Account Deletion ───────────────────────────────────────────
router.post('/gdpr/export', authenticate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        purchases: { include: { product: true } },
        wishlists: { include: { product: true } },
        orders: { include: { product: true } },
        loginHistory: true
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const dump = {
      profile: {
        id: user.id,
        email: user.email,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        country: user.country,
        role: user.role,
        authProvider: user.authProvider,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        isEmailVerified: user.isEmailVerified
      },
      purchases: user.purchases,
      wishlists: user.wishlists,
      orders: user.orders,
      loginHistory: user.loginHistory
    };

    res.status(200).json({
      success: true,
      message: 'GDPR Data Export generated successfully.',
      data: dump
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/me', authenticate, async (req, res, next) => {
  try {
    await prisma.user.delete({ where: { id: req.user.id } });
    res.status(200).json({ success: true, message: 'Account deleted successfully.' });
  } catch (error) {
    next(error);
  }
});

// ── User Preferences & Privacy Settings ───────────────────────────────────────
router.patch('/preferences', authenticate, async (req, res, next) => {
  try {
    const { preferences } = req.body;
    if (!preferences) {
      return res.status(400).json({ success: false, message: 'Preferences object is required.' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { preferencesJson: JSON.stringify(preferences) },
      select: {
        id: true,
        preferencesJson: true
      }
    });

    res.status(200).json({
      success: true,
      message: 'Preferences updated successfully.',
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
});

router.get('/preferences', authenticate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { preferencesJson: true }
    });

    const parsed = user?.preferencesJson ? JSON.parse(user.preferencesJson) : {};
    res.status(200).json({ success: true, data: parsed });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

