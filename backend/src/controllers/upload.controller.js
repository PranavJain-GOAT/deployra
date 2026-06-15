const { upload } = require('../services/upload.service');
const { AppError } = require('../middleware/errorHandler');

const uploadImage = (req, res, next) => {
  const uploadSingle = upload.single('image');

  uploadSingle(req, res, (err) => {
    if (err) {
      return next(new AppError('Image upload failed: ' + err.message, 400));
    }

    if (!req.file) {
      return next(new AppError('Please upload a file', 400));
    }

    // S3 returns req.file.location (full URL)
    // Local disk storage returns req.file.filename (just the name)
    let imageUrl;
    if (req.file.location) {
      // S3 URL
      imageUrl = req.file.location;
    } else if (req.file.filename) {
      // Local storage — return a relative path that the static middleware serves
      imageUrl = `/uploads/${req.file.filename}`;
    } else {
      return next(new AppError('Could not determine upload URL', 500));
    }

    res.status(200).json({ success: true, data: { url: imageUrl } });
  });
};

module.exports = {
  uploadImage
};
