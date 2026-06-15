const multer = require('multer');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

// ─── File Filter ──────────────────────────────────────────────────────────────
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images (PNG, JPG, JPEG, WEBP).'), false);
  }
};

// ─── Helper: Local Disk Storage ───────────────────────────────────────────────
function makeLocalUpload() {
  const uploadDir = path.join(__dirname, '../../uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    logger.info('Created local uploads directory: ' + uploadDir);
  }

  const diskStorage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
  });

  return multer({
    storage: diskStorage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  });
}

// ─── Choose Storage Backend ───────────────────────────────────────────────────
let upload;
let cloudinaryInstance = null;

const cloudinaryReady = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (cloudinaryReady) {
  try {
    const cloudinary = require('cloudinary').v2;

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key:    process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    // Use memory storage + stream to Cloudinary in the controller
    upload = multer({
      storage: multer.memoryStorage(),
      fileFilter,
      limits: { fileSize: 5 * 1024 * 1024 },
    });

    cloudinaryInstance = cloudinary;
    logger.info('✅ Upload service: Cloudinary storage active');
  } catch (err) {
    logger.error('Cloudinary setup failed, falling back to local storage: ' + err.message);
    upload = makeLocalUpload();
  }
} else {
  upload = makeLocalUpload();
  logger.info('ℹ️  Upload service: Local disk storage (development mode)');
}

module.exports = { upload, cloudinaryInstance };
