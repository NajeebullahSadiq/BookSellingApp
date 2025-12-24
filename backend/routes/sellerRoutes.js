const express = require('express');
const router = express.Router();
const {
  getSellerStats,
  getRevenueTrends,
  getTopProducts,
  getRecentSales
} = require('../controllers/sellerController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('seller'));

router.get('/stats', getSellerStats);
router.get('/revenue-trends', getRevenueTrends);
router.get('/top-products', getTopProducts);
router.get('/recent-sales', getRecentSales);

module.exports = router;
