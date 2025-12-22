import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'coverImage') {
      cb(null, path.join(__dirname, '../../uploads/products'));
    } else if (file.fieldname === 'files') {
      cb(null, path.join(__dirname, '../../uploads/products'));
    } else {
      cb(null, path.join(__dirname, '../../uploads/temp'));
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  // Allowed extensions
  const allowedImageTypes = /jpeg|jpg|png|gif/;
  const allowedDocTypes = /pdf|doc|docx|txt/;

  const extname = path.extname(file.originalname).toLowerCase();

  if (file.fieldname === 'coverImage') {
    if (allowedImageTypes.test(extname.replace('.', ''))) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for cover image!'));
    }
  } else if (file.fieldname === 'files') {
    const isValidDoc = allowedDocTypes.test(extname.replace('.', ''));
    const isValidImage = allowedImageTypes.test(extname.replace('.', ''));
    
    if (isValidDoc || isValidImage) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, DOCX, TXT, and image files are allowed!'));
    }
  } else {
    cb(new Error('Unexpected field'));
  }
};

// Multer upload configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
  },
  fileFilter: fileFilter,
});

// Export upload middleware
export const uploadProductFiles = upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'files', maxCount: 5 },
]);

export const uploadSingle = upload.single('file');

export default upload;