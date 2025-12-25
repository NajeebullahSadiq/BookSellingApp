const mongoose = require('mongoose');

const viewHistorySchema = new mongoose.Schema({
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
  viewedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

viewHistorySchema.index({ user: 1, product: 1 });
viewHistorySchema.index({ user: 1, viewedAt: -1 });

module.exports = mongoose.model('ViewHistory', viewHistorySchema);
