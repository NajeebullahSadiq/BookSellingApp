import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        title: String,
        price: Number,
        seller: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentInfo: {
      paymentMethod: {
        type: String,
        enum: ['stripe', 'paypal', 'other'],
        default: 'stripe',
      },
      transactionId: String,
      paymentIntentId: String,
      status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending',
      },
      paidAt: Date,
    },
    orderStatus: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'cancelled'],
      default: 'pending',
    },
    // For tracking downloads
    downloads: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
        },
        downloadedAt: {
          type: Date,
          default: Date.now,
        },
        downloadCount: {
          type: Number,
          default: 0,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ 'items.seller': 1 });
orderSchema.index({ 'paymentInfo.status': 1 });

export default mongoose.model('Order', orderSchema);