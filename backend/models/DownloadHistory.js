const mongoose = require('mongoose');

const downloadHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    default: null
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  productTitle: {
    type: String,
    required: true,
    trim: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    default: null
  },
  fileSize: {
    type: Number,
    default: null
  },
  ipAddress: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  },
  downloadedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

downloadHistorySchema.index({ user: 1, downloadedAt: -1 });
downloadHistorySchema.index({ user: 1, product: 1, downloadedAt: -1 });

module.exports = mongoose.model('DownloadHistory', downloadHistorySchema);
