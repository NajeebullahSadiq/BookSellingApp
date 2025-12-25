const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getPersonalizedRecommendations,
  getSimilarProducts,
  getTrendingProducts,
  getPopularProducts,
  getForYouRecommendations
} = require('../controllers/recommendationController');

router.get('/personalized', protect, getPersonalizedRecommendations);
router.get('/for-you', protect, getForYouRecommendations);
router.get('/similar/:productId', getSimilarProducts);
router.get('/trending', getTrendingProducts);
router.get('/popular', getPopularProducts);

module.exports = router;
