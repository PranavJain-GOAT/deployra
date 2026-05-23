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
      select: { id: true, profileImage: true }
    });
    res.status(200).json({ success: true, data: user, message: 'Avatar removed successfully.' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

