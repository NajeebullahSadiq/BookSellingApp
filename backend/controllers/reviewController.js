const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');

// @desc    Create a review
// @route   POST /api/reviews
// @access  Private (Must have purchased product)
exports.createReview = async (req, res) => {
  try {
    const { product, rating, comment } = req.body;

    // Check if product exists
    const productExists = await Product.findById(product);
    if (!productExists) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check if user has purchased this product
    const hasPurchased = await Order.findOne({
      customer: req.user._id,
      'items.product': product,
      paymentStatus: 'completed'
    });

    const review = await Review.create({
      product,
      user: req.user._id,
      rating,
      comment,
      isVerifiedPurchase: !!hasPurchased
    });

    // Update product rating
    await updateProductRating(product);

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this product' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
exports.getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name profileImage')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: reviews, count: reviews.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper function to update product rating
async function updateProductRating(productId) {
  const reviews = await Review.find({ product: productId });
  if (reviews.length > 0) {
    const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
    await Product.findByIdAndUpdate(productId, { rating: avgRating, numReviews: reviews.length });
  }
}
