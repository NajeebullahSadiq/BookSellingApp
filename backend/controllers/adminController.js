const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Report = require('../models/Report');
const { createNotification } = require('./notificationController');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const users = await User.find()
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await User.countDocuments();

    res.status(200).json({
      success: true,
      data: users,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      total: count
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user role or seller approval
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
exports.updateUser = async (req, res) => {
  try {
    const { role, sellerApproved, sellerVerified, verificationLevel } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (role) user.role = role;
    if (sellerApproved !== undefined && user.role === 'seller') {
      user.sellerProfile.isApproved = sellerApproved;
    }
    if (sellerVerified !== undefined && user.role === 'seller') {
      user.sellerProfile.isVerified = sellerVerified;
      if (sellerVerified) {
        user.sellerProfile.verificationLevel = verificationLevel || 'basic';
        user.sellerProfile.verifiedAt = Date.now();
      } else {
        user.sellerProfile.verificationLevel = 'none';
        user.sellerProfile.verifiedAt = null;
      }
    }

    await user.save();
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all products (including pending)
// @route   GET /api/admin/products
// @access  Private (Admin)
exports.getAllProducts = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = status ? { status } : {};

    const products = await Product.find(query)
      .populate('seller', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      data: products,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      total: count
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve or reject product
// @route   PUT /api/admin/products/:id/review
// @access  Private (Admin)
exports.reviewProduct = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    product.status = status;
    if (status === 'rejected') {
      product.rejectionReason = rejectionReason || 'No reason provided';
    }

    await product.save();

    if (status === 'approved') {
      await createNotification(product.seller, {
        type: 'product_approved',
        title: 'Product Approved! 🎉',
        message: `Your product "${product.title}" has been approved and is now live!`,
        link: '/seller/products',
        relatedProduct: product._id
      });
    } else if (status === 'rejected') {
      await createNotification(product.seller, {
        type: 'product_rejected',
        title: 'Product Rejected',
        message: `Your product "${product.title}" was rejected. Reason: ${product.rejectionReason}`,
        link: '/seller/products',
        relatedProduct: product._id
      });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private (Admin)
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalSellers = await User.countDocuments({ role: 'seller' });
    const totalProducts = await Product.countDocuments();
    const approvedProducts = await Product.countDocuments({ status: 'approved' });
    const pendingProducts = await Product.countDocuments({ status: 'pending' });
    const totalOrders = await Order.countDocuments();
    const completedOrders = await Order.countDocuments({ paymentStatus: 'completed' });
    const totalReports = await Report.countDocuments();
    const pendingReports = await Report.countDocuments({ status: 'pending' });

    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalSellers,
        totalProducts,
        approvedProducts,
        pendingProducts,
        totalOrders,
        completedOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        totalReports,
        pendingReports
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
