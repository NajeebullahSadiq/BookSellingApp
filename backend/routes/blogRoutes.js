const express = require('express');
const router = express.Router();
const {
  createBlog,
  getBlogs,
  getBlogBySlug,
  getBlogById,
  updateBlog,
  deleteBlog,
  getRelatedBlogs
} = require('../controllers/blogController');
const { protect, authorize } = require('../middleware/auth');
const { uploadImage } = require('../middleware/upload');

router.get('/', getBlogs);
router.get('/slug/:slug', getBlogBySlug);
router.get('/:id', getBlogById);
router.get('/:id/related', getRelatedBlogs);

router.post(
  '/',
  protect,
  authorize('admin'),
  uploadImage.single('featuredImage'),
  createBlog
);

router.put(
  '/:id',
  protect,
  authorize('admin'),
  uploadImage.single('featuredImage'),
  updateBlog
);

router.delete('/:id', protect, authorize('admin'), deleteBlog);

module.exports = router;
