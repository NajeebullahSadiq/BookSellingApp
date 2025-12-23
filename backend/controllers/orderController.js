const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Stripe = require('stripe');
const { createNotification } = require('./notificationController');
// Initialize Stripe only if we're not in mock mode
const stripe = process.env.USE_MOCK_PAYMENTS === 'true' ? null : Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock');

// @desc    Create Stripe Checkout Session (with mock payment option)
// @route   POST /api/orders/create-checkout-session
// @access  Private (Customer)
exports.createCheckoutSession = async (req, res) => {
  try {
    const { items } = req.body; // [{ productId }]

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items to purchase' });
    }

    const products = await Product.find({ _id: { $in: items.map(i => i.productId) }, status: 'approved', isActive: true });

    if (!products.length) {
      return res.status(400).json({ success: false, message: 'Products not available' });
    }

    // Check if we're using mock payments
    if (process.env.USE_MOCK_PAYMENTS === 'true') {
      console.log('Using mock payment processing');
      
      // Generate a fake session ID
      const mockSessionId = 'mock_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      
      // Create a pending order
      const order = await Order.create({
        customer: req.user._id,
        items: products.map(p => ({ product: p._id, title: p.title, price: p.price, seller: p.seller })),
        totalAmount: products.reduce((sum, p) => sum + p.price, 0),
        paymentStatus: 'completed', // Auto-complete payment in mock mode
        orderStatus: 'completed',
        completedAt: new Date(),
        stripePaymentId: mockSessionId
      });

      // Update seller stats and create notifications
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, { $inc: { downloads: 0 } });
        await User.findByIdAndUpdate(item.seller, { $inc: { 'sellerProfile.totalSales': 1, 'sellerProfile.earnings': item.price } });
        
        await createNotification(item.seller, {
          type: 'order',
          title: 'New Sale!',
          message: `You made a sale! "${item.title}" was purchased.`,
          link: '/seller/products',
          relatedProduct: item.product,
          relatedOrder: order._id
        });
      }

      await createNotification(req.user._id, {
        type: 'order',
        title: 'Order Completed',
        message: `Your order of ${order.items.length} item(s) has been completed successfully!`,
        link: '/orders',
        relatedOrder: order._id
      });

      return res.status(200).json({ 
        success: true, 
        isMockPayment: true,
        sessionId: mockSessionId, 
        orderId: order._id,
        redirectUrl: `${process.env.CLIENT_URL}/checkout/success?session_id=${mockSessionId}`
      });
    }
    
    // Real Stripe payment flow
    const line_items = products.map(p => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: p.title,
          metadata: { productId: p._id.toString(), sellerId: p.seller.toString() }
        },
        unit_amount: Math.round(p.price * 100)
      },
      quantity: 1
    }));

    try {
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items,
        success_url: `${process.env.CLIENT_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.CLIENT_URL}/checkout/cancel`,
        metadata: { customerId: req.user._id.toString() }
      });

      // Create a pending order
      const order = await Order.create({
        customer: req.user._id,
        items: products.map(p => ({ product: p._id, title: p.title, price: p.price, seller: p.seller })),
        totalAmount: products.reduce((sum, p) => sum + p.price, 0),
        paymentStatus: 'pending',
        orderStatus: 'processing',
        stripePaymentId: session.id
      });

      res.status(200).json({ success: true, sessionId: session.id, orderId: order._id });
    } catch (stripeError) {
      console.error('Stripe error:', stripeError.message);
      return res.status(500).json({ 
        success: false, 
        message: 'Payment service unavailable. Please try enabling mock payments.',
        error: stripeError.message
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Stripe webhook to confirm payment (with mock support)
// @route   POST /api/orders/webhook
// @access  Public (Stripe)
exports.stripeWebhook = async (req, res) => {
  // If we're in mock payment mode, skip webhook processing
  if (process.env.USE_MOCK_PAYMENTS === 'true') {
    console.log('Mock webhook received, no processing needed as orders are auto-completed');
    return res.json({ received: true, mockMode: true });
  }
  
  let event = req.body;
  const sig = req.headers['stripe-signature'];

  try {
    if (process.env.STRIPE_WEBHOOK_SECRET) {
      event = Stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
    }
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const order = await Order.findOne({ stripePaymentId: session.id });
      if (order) {
        order.paymentStatus = 'completed';
        order.orderStatus = 'completed';
        order.completedAt = new Date();
        await order.save();

        // Increment seller stats and create notifications
        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.product, { $inc: { downloads: 0 } });
          await User.findByIdAndUpdate(item.seller, { $inc: { 'sellerProfile.totalSales': 1, 'sellerProfile.earnings': item.price } });
          
          await createNotification(item.seller, {
            type: 'order',
            title: 'New Sale!',
            message: `You made a sale! "${item.title}" was purchased.`,
            link: '/seller/products',
            relatedProduct: item.product,
            relatedOrder: order._id
          });
        }

        await createNotification(order.customer, {
          type: 'order',
          title: 'Order Completed',
          message: `Your order of ${order.items.length} item(s) has been completed successfully!`,
          link: '/orders',
          relatedOrder: order._id
        });
      }
    }

    res.json({ received: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get my orders
// @route   GET /api/orders/my
// @access  Private (Customer)
exports.getMyOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const orders = await Order.find({ customer: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Order.countDocuments({ customer: req.user._id });

    res.status(200).json({
      success: true,
      data: orders,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      total: count
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
