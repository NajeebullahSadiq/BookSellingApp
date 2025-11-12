const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  updateUser,
  deleteUser,
  getAllProducts,
  reviewProduct,
  getDashboardStats
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All routes require admin authorization
router.use(protect, authorize('admin'));

router.get('/users', getAllUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

router.get('/products', getAllProducts);
router.put('/products/:id/review', reviewProduct);

router.get('/stats', getDashboardStats);

module.exports = router;
