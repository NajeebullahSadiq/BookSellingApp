const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');

exports.getSellerStats = async (req, res) => {
  try {
    const sellerId = req.user._id;

    const totalProducts = await Product.countDocuments({ seller: sellerId });
    const approvedProducts = await Product.countDocuments({ seller: sellerId, status: 'approved' });
    const pendingProducts = await Product.countDocuments({ seller: sellerId, status: 'pending' });

    const orders = await Order.find({ 'items.seller': sellerId, paymentStatus: 'completed' });
    
    let totalSales = 0;
    let totalRevenue = 0;
    
    orders.forEach(order => {
      order.items.forEach(item => {
        if (item.seller.toString() === sellerId.toString()) {
          totalSales += 1;
          totalRevenue += item.price;
        }
      });
    });

    const products = await Product.find({ seller: sellerId })
      .select('downloads views rating');
    
    const totalDownloads = products.reduce((sum, p) => sum + p.downloads, 0);
    const totalViews = products.reduce((sum, p) => sum + p.views, 0);
    const avgRating = products.length > 0 
      ? products.reduce((sum, p) => sum + p.rating, 0) / products.length 
      : 0;

    res.status(200).json({
      success: true,
      data: {
        totalProducts,
        approvedProducts,
        pendingProducts,
        totalSales,
        totalRevenue,
        totalDownloads,
        totalViews,
        avgRating: avgRating.toFixed(2)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getRevenueTrends = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const { period = '30days' } = req.query;

    let startDate = new Date();
    let groupBy;

    switch (period) {
      case '7days':
        startDate.setDate(startDate.getDate() - 7);
        groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
        break;
      case '30days':
        startDate.setDate(startDate.getDate() - 30);
        groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
        break;
      case '12months':
        startDate.setMonth(startDate.getMonth() - 12);
        groupBy = { $dateToString: { format: "%Y-%m", date: "$createdAt" } };
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
        groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
    }

    const orders = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          paymentStatus: 'completed'
        }
      },
      { $unwind: '$items' },
      {
        $match: {
          'items.seller': sellerId
        }
      },
      {
        $group: {
          _id: groupBy,
          revenue: { $sum: '$items.price' },
          sales: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: orders.map(item => ({
        date: item._id,
        revenue: item.revenue,
        sales: item.sales
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getTopProducts = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const { sortBy = 'revenue', limit = 10 } = req.query;

    const orders = await Order.find({ 
      'items.seller': sellerId, 
      paymentStatus: 'completed' 
    });

    const productStats = {};

    orders.forEach(order => {
      order.items.forEach(item => {
        if (item.seller.toString() === sellerId.toString()) {
          if (!productStats[item.product.toString()]) {
            productStats[item.product.toString()] = {
              productId: item.product,
              title: item.title,
              sales: 0,
              revenue: 0
            };
          }
          productStats[item.product.toString()].sales += 1;
          productStats[item.product.toString()].revenue += item.price;
        }
      });
    });

    let topProducts = Object.values(productStats);

    if (sortBy === 'revenue') {
      topProducts.sort((a, b) => b.revenue - a.revenue);
    } else if (sortBy === 'sales') {
      topProducts.sort((a, b) => b.sales - a.sales);
    }

    const products = await Product.find({ 
      _id: { $in: topProducts.slice(0, limit).map(p => p.productId) } 
    }).select('title previewImage rating downloads views');

    const enrichedProducts = topProducts.slice(0, limit).map(stat => {
      const product = products.find(p => p._id.toString() === stat.productId.toString());
      return {
        ...stat,
        previewImage: product?.previewImage,
        rating: product?.rating,
        downloads: product?.downloads,
        views: product?.views
      };
    });

    res.status(200).json({
      success: true,
      data: enrichedProducts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getRecentSales = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const { limit = 10 } = req.query;

    const orders = await Order.find({
      'items.seller': sellerId,
      paymentStatus: 'completed'
    })
    .populate('customer', 'name email')
    .sort({ createdAt: -1 })
    .limit(Number(limit));

    const sales = [];
    orders.forEach(order => {
      order.items.forEach(item => {
        if (item.seller.toString() === sellerId.toString()) {
          sales.push({
            orderId: order._id,
            orderNumber: order.orderNumber,
            customer: order.customer,
            product: item.title,
            price: item.price,
            date: order.createdAt
          });
        }
      });
    });

    res.status(200).json({
      success: true,
      data: sales.slice(0, limit)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
