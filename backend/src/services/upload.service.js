const multer = require('multer');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

// ─── File Filter ─────────────────────────────────────────────────────────────
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'), false);
  }
};

// ─── Ensure uploads directory exists ─────────────────────────────────────────
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  logger.info('Created uploads directory at: ' + uploadDir);
}

// ─── Local Disk Storage ───────────────────────────────────────────────────────
const localStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const localUpload = multer({
  storage: localStorage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// ─── S3 Upload (only if configured) ──────────────────────────────────────────
const isS3Configured = !!(
  process.env.AWS_ACCESS_KEY_ID &&
  process.env.AWS_SECRET_ACCESS_KEY &&
  process.env.AWS_S3_BUCKET_NAME &&
  process.env.AWS_ACCESS_KEY_ID !== 'fake_access_key'
);

let upload = localUpload;

if (isS3Configured) {
  try {
    const { S3Client } = require('@aws-sdk/client-s3');
    const multerS3 = require('multer-s3');

    const s3Config = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      }
    });

    const s3Upload = multer({
      storage: multerS3({
        s3: s3Config,
        bucket: process.env.AWS_S3_BUCKET_NAME,
        metadata: function (req, file, cb) {
          cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          cb(null, 'products/' + file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
        }
      }),
      fileFilter: fileFilter,
      limits: { fileSize: 5 * 1024 * 1024 }
    });

    upload = s3Upload;
    logger.info('Using S3 storage for uploads');
  } catch (err) {
    logger.warn('S3 setup failed, falling back to local storage: ' + err.message);
    upload = localUpload;
  }
} else {
  logger.info('AWS S3 not configured — using local disk storage for uploads');
}

module.exports = { upload };
