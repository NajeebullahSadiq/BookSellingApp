const Product = require('../models/Product');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');

// @desc    Create new product
// @route   POST /api/products
// @access  Private (Seller only)
exports.createProduct = async (req, res) => {
  try {
    const { title, description, price, category, subcategory, tags } = req.body;

    if (!req.files || !req.files.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    const file = req.files.file[0];
    const previewImage = req.files.previewImage ? req.files.previewImage[0] : null;

    const product = await Product.create({
      title,
      description,
      price,
      category,
      subcategory,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
      seller: req.user._id,
      fileUrl: `/uploads/products/${file.filename}`,
      fileName: file.originalname,
      fileSize: file.size,
      fileType: file.mimetype,
      previewImage: previewImage ? `/uploads/images/${previewImage.filename}` : null,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all products (with filters)
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
  try {
    const {
      category,
      search,
      minPrice,
      maxPrice,
      sortBy,
      page = 1,
      limit = 12
    } = req.query;

    let query = { status: 'approved', isActive: true };

    // Category filter
    if (category) {
      query.category = category;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Sorting
    let sort = {};
    switch (sortBy) {
      case 'price-asc':
        sort.price = 1;
        break;
      case 'price-desc':
        sort.price = -1;
        break;
      case 'rating':
        sort.rating = -1;
        break;
      case 'popular':
        sort.downloads = -1;
        break;
      default:
        sort.createdAt = -1;
    }

    const products = await Product.find(query)
      .populate('seller', 'name sellerProfile')
      .populate('category', 'name slug')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      data: products,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('seller', 'name email sellerProfile')
      .populate('category', 'name slug');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Increment view count
    product.views += 1;
    await product.save();

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Seller - own products only)
exports.updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check ownership
    if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this product'
      });
    }

    const { title, description, price, category, subcategory, tags } = req.body;

    product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        title: title || product.title,
        description: description || product.description,
        price: price || product.price,
        category: category || product.category,
        subcategory: subcategory || product.subcategory,
        tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : product.tags,
        status: 'pending' // Reset to pending after edit
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Seller - own products or Admin)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check ownership
    if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this product'
      });
    }

    // Delete associated files
    if (product.fileUrl) {
      const filePath = path.join(__dirname, '..', product.fileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    if (product.previewImage) {
      const imagePath = path.join(__dirname, '..', product.previewImage);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get seller's own products
// @route   GET /api/products/seller/my-products
// @access  Private (Seller only)
exports.getSellerProducts = async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user._id })
      .populate('category', 'name slug')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: products,
      count: products.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Download product file
// @route   GET /api/products/:id/download
// @access  Private (Must have purchased)
exports.downloadProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user has purchased this product
    const Order = require('../models/Order');
    const hasPurchased = await Order.findOne({
      customer: req.user._id,
      'items.product': product._id,
      paymentStatus: 'completed'
    });

    if (!hasPurchased && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You must purchase this product to download it'
      });
    }

    const filePath = path.join(__dirname, '..', product.fileUrl);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Increment download count
    product.downloads += 1;
    await product.save();

    res.download(filePath, product.fileName);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
