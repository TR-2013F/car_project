const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const uploadDirectory = path.resolve(__dirname, '..', 'uploads');
const imageTypes = {
  'image/gif': '.gif',
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

const storage = multer.diskStorage({
  destination(req, file, callback) {
    fs.mkdir(uploadDirectory, { recursive: true }, (error) => {
      callback(error, uploadDirectory);
    });
  },
  filename(req, file, callback) {
    callback(null, `${crypto.randomUUID()}${imageTypes[file.mimetype]}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter(req, file, callback) {
    if (!Object.prototype.hasOwnProperty.call(imageTypes, file.mimetype)) {
      const error = new Error('Formato de imagem inválido. Use JPG, PNG, GIF ou WEBP.');
      error.status = 400;
      return callback(error);
    }

    return callback(null, true);
  },
});

module.exports = { upload, uploadDirectory };
