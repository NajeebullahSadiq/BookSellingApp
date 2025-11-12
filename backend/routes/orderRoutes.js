const express = require('express');
const router = express.Router();
const { createCheckoutSession, stripeWebhook, getMyOrders } = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

router.post('/create-checkout-session', protect, createCheckoutSession);
router.post('/webhook', stripeWebhook);
router.get('/my', protect, getMyOrders);

module.exports = router;
