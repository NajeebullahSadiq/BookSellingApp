const express = require('express');
const router = express.Router();
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getSellerProducts,
  downloadProduct
} = require('../controllers/productController');
const { protect, authorize, checkSellerApproval } = require('../middleware/auth');
const { uploadProductWithImage } = require('../middleware/upload');

router.get('/', getProducts);
router.get('/seller/my-products', protect, authorize('seller'), getSellerProducts);
router.get('/:id', getProductById);
router.get('/:id/download', protect, downloadProduct);

router.post(
  '/',
  protect,
  authorize('seller'),
  checkSellerApproval,
  uploadProductWithImage.fields([
    { name: 'file', maxCount: 1 },
    { name: 'previewImage', maxCount: 1 }
  ]),
  createProduct
);

router.put('/:id', protect, authorize('seller', 'admin'), updateProduct);
router.delete('/:id', protect, authorize('seller', 'admin'), deleteProduct);

module.exports = router;
