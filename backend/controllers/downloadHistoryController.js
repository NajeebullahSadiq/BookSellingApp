const DownloadHistory = require('../models/DownloadHistory');

exports.getMyDownloadHistory = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const query = { user: req.user._id };

    const [items, total] = await Promise.all([
      DownloadHistory.find(query)
        .sort({ downloadedAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('product', 'title previewImage fileType fileSize')
        .populate('seller', 'name')
        .select('-__v'),
      DownloadHistory.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: items,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
