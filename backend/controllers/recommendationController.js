const Product = require('../models/Product');
const Order = require('../models/Order');
const ViewHistory = require('../models/ViewHistory');

// @desc    Get personalized recommendations
// @route   GET /api/recommendations/personalized
// @access  Private
exports.getPersonalizedRecommendations = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const userId = req.user._id;

    const purchasedProducts = await Order.aggregate([
      { $match: { customer: userId, paymentStatus: 'completed' } },
      { $unwind: '$items' },
      { $group: { _id: '$items.product' } }
    ]);

    const purchasedProductIds = purchasedProducts.map(p => p._id);

    const viewedProducts = await ViewHistory.find({ user: userId })
      .sort({ viewedAt: -1 })
      .limit(20)
      .select('product');

    const viewedProductIds = viewedProducts.map(v => v.product);

    const interactedProducts = await Product.find({
      _id: { $in: [...viewedProductIds, ...purchasedProductIds] }
    }).select('category tags');

    const categoryIds = [...new Set(interactedProducts.map(p => p.category?.toString()))].filter(Boolean);
    const allTags = interactedProducts.flatMap(p => p.tags || []);
    const topTags = [...new Set(allTags)].slice(0, 10);

    let recommendations = await Product.find({
      status: 'approved',
      isActive: true,
      _id: { $nin: [...purchasedProductIds, ...viewedProductIds] },
      $or: [
        { category: { $in: categoryIds } },
        { tags: { $in: topTags } }
      ]
    })
      .populate('seller', 'name sellerProfile')
      .populate('category', 'name slug')
      .sort({ rating: -1, downloads: -1 })
      .limit(limit);

    if (recommendations.length < limit) {
      const fallbackCount = limit - recommendations.length;
      const fallback = await Product.find({
        status: 'approved',
        isActive: true,
        _id: { $nin: [...purchasedProductIds, ...viewedProductIds, ...recommendations.map(r => r._id)] }
      })
        .populate('seller', 'name sellerProfile')
        .populate('category', 'name slug')
        .sort({ rating: -1, downloads: -1 })
        .limit(fallbackCount);

      recommendations = [...recommendations, ...fallback];
    }

    res.json({
      success: true,
      data: recommendations,
      count: recommendations.length
    });
  } catch (error) {
    console.error('Personalized recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recommendations',
      error: error.message
    });
  }
};

// @desc    Get similar products
// @route   GET /api/recommendations/similar/:productId
// @access  Public
exports.getSimilarProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const productId = req.params.productId;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    let similarProducts = await Product.find({
      status: 'approved',
      isActive: true,
      _id: { $ne: productId },
      $or: [
        { category: product.category },
        { tags: { $in: product.tags || [] } },
        { seller: product.seller }
      ]
    })
      .populate('seller', 'name sellerProfile')
      .populate('category', 'name slug')
      .sort({ rating: -1 })
      .limit(limit);

    if (similarProducts.length < limit) {
      const fallbackCount = limit - similarProducts.length;
      const fallback = await Product.find({
        status: 'approved',
        isActive: true,
        _id: { $ne: productId, $nin: similarProducts.map(p => p._id) }
      })
        .populate('seller', 'name sellerProfile')
        .populate('category', 'name slug')
        .sort({ rating: -1, downloads: -1 })
        .limit(fallbackCount);

      similarProducts = [...similarProducts, ...fallback];
    }

    res.json({
      success: true,
      data: similarProducts,
      count: similarProducts.length
    });
  } catch (error) {
    console.error('Similar products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching similar products',
      error: error.message
    });
  }
};

// @desc    Get trending products
// @route   GET /api/recommendations/trending
// @access  Public
exports.getTrendingProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const days = parseInt(req.query.days) || 7;

    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    const recentViews = await ViewHistory.aggregate([
      { $match: { viewedAt: { $gte: dateThreshold } } },
      { $group: { _id: '$product', viewCount: { $sum: 1 } } },
      { $sort: { viewCount: -1 } },
      { $limit: limit }
    ]);

    const productIds = recentViews.map(v => v._id);

    const products = await Product.find({
      _id: { $in: productIds },
      status: 'approved',
      isActive: true
    })
      .populate('seller', 'name sellerProfile')
      .populate('category', 'name slug');

    const productsWithViews = products.map(product => {
      const viewData = recentViews.find(v => v._id.toString() === product._id.toString());
      return {
        ...product.toObject(),
        trendingViews: viewData?.viewCount || 0
      };
    });

    productsWithViews.sort((a, b) => b.trendingViews - a.trendingViews);

    res.json({
      success: true,
      data: productsWithViews,
      count: productsWithViews.length
    });
  } catch (error) {
    console.error('Trending products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching trending products',
      error: error.message
    });
  }
};

// @desc    Get popular products
// @route   GET /api/recommendations/popular
// @access  Public
exports.getPopularProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const products = await Product.find({
      status: 'approved',
      isActive: true
    })
      .populate('seller', 'name sellerProfile')
      .populate('category', 'name slug')
      .sort({ downloads: -1, rating: -1, views: -1 })
      .limit(limit);

    res.json({
      success: true,
      data: products,
      count: products.length
    });
  } catch (error) {
    console.error('Popular products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching popular products',
      error: error.message
    });
  }
};

// @desc    Get "for you" recommendations (combines multiple strategies)
// @route   GET /api/recommendations/for-you
// @access  Private
exports.getForYouRecommendations = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 12;

    const [personalized, trending, popular] = await Promise.all([
      exports.getPersonalizedRecommendations({ user: req.user, query: { limit: Math.ceil(limit * 0.5) } }, { json: () => {} }),
      exports.getTrendingProducts({ query: { limit: Math.ceil(limit * 0.3) } }, { json: () => {} }),
      exports.getPopularProducts({ query: { limit: Math.ceil(limit * 0.2) } }, { json: () => {} })
    ]);

    const combined = [
      ...(personalized?.data || []),
      ...(trending?.data || []),
      ...(popular?.data || [])
    ];

    const uniqueProducts = combined.reduce((acc, product) => {
      const productId = product._id.toString();
      if (!acc.some(p => p._id.toString() === productId)) {
        acc.push(product);
      }
      return acc;
    }, []);

    const finalRecommendations = uniqueProducts.slice(0, limit);

    res.json({
      success: true,
      data: finalRecommendations,
      count: finalRecommendations.length
    });
  } catch (error) {
    console.error('For you recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recommendations',
      error: error.message
    });
  }
};
