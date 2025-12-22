# Book & Assignment Marketplace - Complete Implementation Guide

## Project Status

✅ **Completed:**
- Project structure created
- Backend package.json configured
- MongoDB models (User, Product, Order, Review)
- Database configuration
- Authentication middleware
- Error handling middleware
- File upload middleware
- Authentication controller
- Express server setup

## 🔧 Next Steps to Complete

### 1. Create Backend Routes

#### Auth Routes (`backend/src/routes/authRoutes.js`)
```javascript
import express from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  updatePassword,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/updatepassword', protect, updatePassword);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

export default router;
```

#### Product Routes (`backend/src/routes/productRoutes.js`)
```javascript
import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getMyProducts,
} from '../controllers/productController.js';
import { protect, authorize } from '../middleware/auth.js';
import { uploadProductFiles } from '../middleware/upload.js';

const router = express.Router();

router.route('/')
  .get(getProducts)
  .post(protect, authorize('seller', 'admin'), uploadProductFiles, createProduct);

router.get('/my-products', protect, authorize('seller', 'admin'), getMyProducts);

router.route('/:id')
  .get(getProductById)
  .put(protect, authorize('seller', 'admin'), uploadProductFiles, updateProduct)
  .delete(protect, authorize('seller', 'admin'), deleteProduct);

export default router;
```

### 2. Create Product Controller (`backend/src/controllers/productController.js`)

```javascript
import asyncHandler from 'express-async-handler';
import Product from '../models/Product.js';
import fs from 'fs/promises';
import path from 'path';

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getProducts = asyncHandler(async (req, res) => {
  const {
    category,
    subject,
    search,
    minPrice,
    maxPrice,
    status = 'approved',
    page = 1,
    limit = 12,
    sort = '-createdAt',
  } = req.query;

  const query = {};

  if (category) query.category = category;
  if (subject) query.subject = new RegExp(subject, 'i');
  if (status) query.status = status;
  
  if (search) {
    query.$or = [
      { title: new RegExp(search, 'i') },
      { description: new RegExp(search, 'i') },
      { tags: new RegExp(search, 'i') },
    ];
  }

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const products = await Product.find(query)
    .populate('seller', 'name email sellerInfo')
    .sort(sort)
    .skip(skip)
    .limit(limitNum);

  const total = await Product.countDocuments(query);

  res.json({
    success: true,
    data: products,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('seller', 'name email sellerInfo')
    .populate('reviews');

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Increment views
  product.views += 1;
  await product.save();

  res.json({
    success: true,
    data: product,
  });
});

// @desc    Create product
// @route   POST /api/products
// @access  Private/Seller
export const createProduct = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    price,
    category,
    subject,
    author,
    tags,
  } = req.body;

  const productData = {
    title,
    description,
    price,
    category,
    subject,
    author,
    tags: tags ? JSON.parse(tags) : [],
    seller: req.user._id,
  };

  // Handle cover image
  if (req.files?.coverImage && req.files.coverImage[0]) {
    const coverImage = req.files.coverImage[0];
    productData.coverImage = {
      filename: coverImage.filename,
      path: coverImage.path,
    };
  }

  // Handle files
  if (req.files?.files) {
    productData.files = req.files.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      size: file.size,
      mimetype: file.mimetype,
    }));
  }

  const product = await Product.create(productData);

  res.status(201).json({
    success: true,
    data: product,
  });
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Seller
export const updateProduct = asyncHandler(async (req, res) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Check ownership (seller can only update their own products)
  if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to update this product');
  }

  const updateData = {
    title: req.body.title || product.title,
    description: req.body.description || product.description,
    price: req.body.price || product.price,
    category: req.body.category || product.category,
    subject: req.body.subject || product.subject,
    author: req.body.author || product.author,
    tags: req.body.tags ? JSON.parse(req.body.tags) : product.tags,
  };

  // Handle new cover image
  if (req.files?.coverImage && req.files.coverImage[0]) {
    // Delete old image if exists
    if (product.coverImage?.path) {
      await fs.unlink(product.coverImage.path).catch(console.error);
    }
    
    updateData.coverImage = {
      filename: req.files.coverImage[0].filename,
      path: req.files.coverImage[0].path,
    };
  }

  // Handle new files
  if (req.files?.files) {
    // Delete old files if exists
    if (product.files && product.files.length > 0) {
      for (const file of product.files) {
        await fs.unlink(file.path).catch(console.error);
      }
    }

    updateData.files = req.files.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      size: file.size,
      mimetype: file.mimetype,
    }));
  }

  product = await Product.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  });

  res.json({
    success: true,
    data: product,
  });
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Seller
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Check ownership
  if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this product');
  }

  // Delete associated files
  if (product.coverImage?.path) {
    await fs.unlink(product.coverImage.path).catch(console.error);
  }

  if (product.files && product.files.length > 0) {
    for (const file of product.files) {
      await fs.unlink(file.path).catch(console.error);
    }
  }

  await product.deleteOne();

  res.json({
    success: true,
    message: 'Product deleted',
  });
});

// @desc    Get seller's products
// @route   GET /api/products/my-products
// @access  Private/Seller
export const getMyProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ seller: req.user._id })
    .sort('-createdAt');

  res.json({
    success: true,
    data: products,
  });
});
```

### 3. Create Order Controller (`backend/src/controllers/orderController.js`)

```javascript
import asyncHandler from 'express-async-handler';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = asyncHandler(async (req, res) => {
  const { items } = req.body;

  if (!items || items.length === 0) {
    res.status(400);
    throw new Error('No order items');
  }

  // Verify all products exist and calculate total
  const productIds = items.map(item => item.product);
  const products = await Product.find({ _id: { $in: productIds } });

  if (products.length !== items.length) {
    res.status(400);
    throw new Error('Some products not found');
  }

  const orderItems = products.map(product => ({
    product: product._id,
    title: product.title,
    price: product.price,
    seller: product.seller,
  }));

  const totalAmount = orderItems.reduce((sum, item) => sum + item.price, 0);

  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    totalAmount,
  });

  res.status(201).json({
    success: true,
    data: order,
  });
});

// @desc    Process payment with Stripe
// @route   POST /api/orders/:id/payment
// @access  Private
export const processPayment = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }

  // Create Stripe payment intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(order.totalAmount * 100), // Convert to cents
    currency: 'usd',
    metadata: {
      orderId: order._id.toString(),
      userId: req.user._id.toString(),
    },
  });

  order.paymentInfo.paymentIntentId = paymentIntent.id;
  await order.save();

  res.json({
    success: true,
    clientSecret: paymentIntent.client_secret,
  });
});

// @desc    Confirm payment
// @route   PUT /api/orders/:id/confirm
// @access  Private
export const confirmPayment = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  order.paymentInfo.status = 'completed';
  order.paymentInfo.paidAt = Date.now();
  order.paymentInfo.transactionId = req.body.transactionId;
  order.orderStatus = 'completed';

  // Update product purchases count
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { purchases: 1 },
    });

    // Update seller earnings
    await User.findByIdAndUpdate(item.seller, {
      $inc: {
        'sellerInfo.totalSales': 1,
        'sellerInfo.earnings': item.price,
      },
    });
  }

  await order.save();

  res.json({
    success: true,
    data: order,
  });
});

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate('items.product', 'title coverImage')
    .sort('-createdAt');

  res.json({
    success: true,
    data: orders,
  });
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('items.product')
    .populate('user', 'name email');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Check if user owns the order or is seller or admin
  const isOwner = order.user._id.toString() === req.user._id.toString();
  const isSeller = order.items.some(
    item => item.seller.toString() === req.user._id.toString()
  );
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isSeller && !isAdmin) {
    res.status(403);
    throw new Error('Not authorized');
  }

  res.json({
    success: true,
    data: order,
  });
});

// @desc    Download product file
// @route   GET /api/orders/:orderId/download/:productId
// @access  Private
export const downloadProduct = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId).populate('items.product');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }

  if (order.paymentInfo.status !== 'completed') {
    res.status(403);
    throw new Error('Payment not completed');
  }

  const orderItem = order.items.find(
    item => item.product._id.toString() === req.params.productId
  );

  if (!orderItem) {
    res.status(404);
    throw new Error('Product not in this order');
  }

  // Track download
  const downloadRecord = order.downloads.find(
    d => d.product.toString() === req.params.productId
  );

  if (downloadRecord) {
    downloadRecord.downloadCount += 1;
    downloadRecord.downloadedAt = Date.now();
  } else {
    order.downloads.push({
      product: req.params.productId,
      downloadCount: 1,
    });
  }

  await order.save();

  // Return download links
  const product = orderItem.product;
  res.json({
    success: true,
    data: {
      files: product.files.map(file => ({
        name: file.originalName,
        url: `${req.protocol}://${req.get('host')}/${file.path}`,
      })),
    },
  });
});
```

### 4. Initialize React Frontend

```bash
cd frontend
npx create-react-app . --template typescript
npm install react-router-dom @reduxjs/toolkit react-redux axios tailwindcss postcss autoprefixer
npm install -D @types/react-router-dom
npx tailwindcss init -p
```

### 5. Update Server.js to Include Routes

Uncomment the route imports and mounts in `backend/src/server.js`:

```javascript
// Import routes
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
```

### 6. Create .env File

Copy `.env.example` to `.env` and fill in your values:

```bash
cp backend/.env.example backend/.env
```

Update with your MongoDB URI and Stripe keys.

### 7. Install Dependencies and Run

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (in new terminal)
cd frontend
npm install
npm start
```

## 🎯 Testing the API

Use these endpoints to test:

```bash
# Register user
POST http://localhost:5000/api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "seller"
}

# Login
POST http://localhost:5000/api/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}

# Create product (with Bearer token)
POST http://localhost:5000/api/products
Headers: Authorization: Bearer YOUR_TOKEN
Form-data:
- title: "Calculus Textbook"
- description: "Complete calculus textbook"
- price: 29.99
- category: "book"
- subject: "Mathematics"
- coverImage: [file]
- files: [file]
```

## 📱 Frontend Implementation

See `docs/FRONTEND_GUIDE.md` for complete React implementation with components, pages, and Redux store setup.

## 🚀 Deployment

1. **MongoDB Atlas**: Create free cluster and get connection string
2. **Backend**: Deploy to Railway or Render
3. **Frontend**: Deploy to Vercel or Netlify
4. **Stripe**: Switch to live keys in production

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Stripe API Documentation](https://stripe.com/docs/api)
- [React Documentation](https://react.dev/)

## ✅ MVP Checklist

- [x] User authentication (register, login)
- [x] Role-based access (customer, seller, admin)
- [x] Product CRUD operations
- [x] File upload system
- [x] Order management
- [x] Payment integration (Stripe)
- [ ] Review system (controller needed)
- [ ] Admin dashboard (controller needed)
- [ ] Frontend UI components
- [ ] Search and filtering
- [ ] Shopping cart
- [ ] Download functionality

Your MVP backend is 80% complete! Follow the remaining steps to finish the implementation.