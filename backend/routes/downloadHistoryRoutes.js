const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth');
const { getMyDownloadHistory } = require('../controllers/downloadHistoryController');

router.get('/my', protect, getMyDownloadHistory);

module.exports = router;
