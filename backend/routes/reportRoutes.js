const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createReport,
  getAllReports,
  getReportById,
  updateReportStatus,
  deleteReport,
  getMyReports,
  getReportStats
} = require('../controllers/reportController');

router.post('/', protect, createReport);
router.get('/my-reports', protect, getMyReports);
router.get('/stats', protect, authorize('admin'), getReportStats);
router.get('/', protect, authorize('admin'), getAllReports);
router.get('/:id', protect, authorize('admin'), getReportById);
router.put('/:id', protect, authorize('admin'), updateReportStatus);
router.delete('/:id', protect, authorize('admin'), deleteReport);

module.exports = router;
