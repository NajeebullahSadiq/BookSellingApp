const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const createUploadDirs = () => {
  const dirs = ['./uploads/products', './uploads/images', './uploads/profiles', './uploads/previews'];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

createUploadDirs();

// Storage configuration for product files
const productStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/products');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Storage configuration for images
const imageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/images');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'image-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for product files (PDF, DOCX, etc.)
const productFileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx|ppt|pptx|txt|zip|rar/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only PDF, DOC, DOCX, PPT, PPTX, TXT, ZIP, and RAR files are allowed'));
  }
};

// File filter for images
const imageFileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only JPEG, JPG, PNG, GIF, and WEBP images are allowed'));
  }
};

// Multer upload instances
exports.uploadProductFile = multer({
  storage: productStorage,
  fileFilter: productFileFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

exports.uploadImage = multer({
  storage: imageStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Combined upload for product with image
exports.uploadProductWithImage = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      if (file.fieldname === 'file') {
        cb(null, './uploads/products');
      } else if (file.fieldname === 'previewImage') {
        cb(null, './uploads/images');
      } else if (file.fieldname === 'previewPages') {
        cb(null, './uploads/previews');
      }
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      let prefix = 'file-';
      if (file.fieldname === 'file') {
        prefix = 'product-';
      } else if (file.fieldname === 'previewImage') {
        prefix = 'image-';
      } else if (file.fieldname === 'previewPages') {
        prefix = 'preview-';
      }
      cb(null, prefix + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  fileFilter: function (req, file, cb) {
    if (file.fieldname === 'file') {
      productFileFilter(req, file, cb);
    } else if (file.fieldname === 'previewImage' || file.fieldname === 'previewPages') {
      imageFileFilter(req, file, cb);
    } else {
      cb(new Error('Invalid field name'));
    }
  },
  limits: { fileSize: 50 * 1024 * 1024 }
});
