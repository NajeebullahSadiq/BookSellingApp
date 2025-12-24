const Report = require('../models/Report');
const Product = require('../models/Product');
const Review = require('../models/Review');

exports.createReport = async (req, res) => {
  try {
    const { reportType, reportedItem, reason, description } = req.body;

    if (!reportType || !reportedItem || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide reportType, reportedItem, and reason'
      });
    }

    let itemExists = false;
    if (reportType === 'product') {
      itemExists = await Product.findById(reportedItem);
    } else if (reportType === 'review') {
      itemExists = await Review.findById(reportedItem);
    }

    if (!itemExists) {
      return res.status(404).json({
        success: false,
        message: `${reportType} not found`
      });
    }

    const existingReport = await Report.findOne({
      reportedItem,
      reportedBy: req.user._id,
      status: { $in: ['pending', 'reviewed'] }
    });

    if (existingReport) {
      return res.status(400).json({
        success: false,
        message: 'You have already reported this item'
      });
    }

    const report = await Report.create({
      reportType,
      reportedItem,
      reportedBy: req.user._id,
      reason,
      description
    });

    await report.populate([
      { path: 'reportedBy', select: 'name email' },
      { path: 'reportedItem' }
    ]);

    res.status(201).json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating report',
      error: error.message
    });
  }
};

exports.getAllReports = async (req, res) => {
  try {
    const { status, reportType, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (reportType) query.reportType = reportType;

    const skip = (page - 1) * limit;

    const reports = await Report.find(query)
      .populate('reportedBy', 'name email')
      .populate({
        path: 'reportedItem',
        populate: reportType === 'review' ? { path: 'user product', select: 'name title' } : { path: 'seller', select: 'name email' }
      })
      .populate('resolvedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Report.countDocuments(query);

    res.json({
      success: true,
      count: reports.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: reports
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reports',
      error: error.message
    });
  }
};

exports.getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('reportedBy', 'name email')
      .populate({
        path: 'reportedItem',
        populate: { path: 'user product seller', select: 'name email title' }
      })
      .populate('resolvedBy', 'name email');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching report',
      error: error.message
    });
  }
};

exports.updateReportStatus = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;

    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    if (status) {
      report.status = status;
      if (status === 'resolved' || status === 'dismissed') {
        report.resolvedBy = req.user._id;
        report.resolvedAt = Date.now();
      }
    }

    if (adminNotes !== undefined) {
      report.adminNotes = adminNotes;
    }

    await report.save();

    await report.populate([
      { path: 'reportedBy', select: 'name email' },
      { path: 'reportedItem' },
      { path: 'resolvedBy', select: 'name email' }
    ]);

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Update report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating report',
      error: error.message
    });
  }
};

exports.deleteReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    await report.deleteOne();

    res.json({
      success: true,
      message: 'Report deleted successfully'
    });
  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting report',
      error: error.message
    });
  }
};

exports.getMyReports = async (req, res) => {
  try {
    const reports = await Report.find({ reportedBy: req.user._id })
      .populate('reportedItem')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (error) {
    console.error('Get my reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching your reports',
      error: error.message
    });
  }
};

exports.getReportStats = async (req, res) => {
  try {
    const stats = await Report.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const typeStats = await Report.aggregate([
      {
        $group: {
          _id: '$reportType',
          count: { $sum: 1 }
        }
      }
    ]);

    const reasonStats = await Report.aggregate([
      {
        $group: {
          _id: '$reason',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        byStatus: stats,
        byType: typeStats,
        byReason: reasonStats,
        total: await Report.countDocuments()
      }
    });
  } catch (error) {
    console.error('Get report stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching report statistics',
      error: error.message
    });
  }
};
