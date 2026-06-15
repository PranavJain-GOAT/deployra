const { upload, cloudinaryInstance } = require('../services/upload.service');
const { AppError } = require('../middleware/errorHandler');
const { Readable } = require('stream');

const uploadImage = (req, res, next) => {
  const uploadSingle = upload.single('image');

  uploadSingle(req, res, async (err) => {
    if (err) {
      return next(new AppError('Image upload failed: ' + err.message, 400));
    }

    if (!req.file) {
      return next(new AppError('Please upload a file', 400));
    }

    try {
      let imageUrl;

      if (cloudinaryInstance) {
        // ── Cloudinary: stream buffer to Cloudinary ──────────────────────────
        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinaryInstance.uploader.upload_stream(
            {
              folder: 'deployra/products',
              transformation: [{ quality: 'auto', fetch_format: 'auto' }],
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );

          // Convert buffer to readable stream and pipe to Cloudinary
          const bufferStream = Readable.from(req.file.buffer);
          bufferStream.pipe(uploadStream);
        });

        imageUrl = result.secure_url;
      } else {
        // ── Local disk: file already saved, return path ──────────────────────
        imageUrl = req.file.location || `/uploads/${req.file.filename}`;
      }

      return res.status(200).json({ success: true, data: { url: imageUrl } });
    } catch (uploadErr) {
      return next(new AppError('Image upload failed: ' + uploadErr.message, 500));
    }
  });
};

module.exports = { uploadImage };
