const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Category = require('./models/Category');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Review = require('./models/Review');

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};



// Sample data
const seedDatabase = async () => {
  try {
    // Connect to database
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    await Review.deleteMany({});

    console.log('Data cleared from database');

    // Create users
    const johnUser = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: 'customer',
      isVerified: true,
      profileImage: 'profile-john.jpg'
    });

    const janeUser = await User.create({
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: 'password123',
      role: 'seller',
      isVerified: true,
      profileImage: 'profile-jane.jpg',
      sellerProfile: {
        bio: 'Experienced academic with 10 years of teaching experience',
        storeName: 'Jane\'s Academic Hub',
        rating: 4.8,
        totalSales: 142,
        earnings: 2840,
        isApproved: true
      }
    });

    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@bookseller.com',
      password: 'admin123',
      role: 'admin',
      isVerified: true,
      profileImage: 'admin-profile.jpg'
    });

    const robertUser = await User.create({
      name: 'Robert Johnson',
      email: 'robert@example.com',
      password: 'password123',
      role: 'seller',
      isVerified: true,
      profileImage: 'profile-robert.jpg',
      sellerProfile: {
        bio: 'Mathematics professor with research focus on applied statistics',
        storeName: 'Rob\'s Math Resources',
        rating: 4.5,
        totalSales: 87,
        earnings: 1740,
        isApproved: true
      }
    });

    const sarahUser = await User.create({
      name: 'Sarah Williams',
      email: 'sarah@example.com',
      password: 'password123',
      role: 'customer',
      isVerified: true,
      profileImage: 'profile-sarah.jpg'
    });

    console.log('Users created');

    // Create categories
    const textbooksCategory = await Category.create({
      name: 'Textbooks',
      description: 'Official textbooks for various courses',
      icon: 'book-icon.svg',
      isActive: true,
      productCount: 25
    });

    const notesCategory = await Category.create({
      name: 'Lecture Notes',
      description: 'Comprehensive notes from lectures',
      icon: 'notes-icon.svg',
      isActive: true,
      productCount: 18
    });

    const guidesCategory = await Category.create({
      name: 'Study Guides',
      description: 'Guides to help with studying and exam preparation',
      icon: 'guide-icon.svg',
      isActive: true,
      productCount: 12
    });

    const papersCategory = await Category.create({
      name: 'Research Papers',
      description: 'Academic research papers and publications',
      icon: 'paper-icon.svg',
      isActive: true,
      productCount: 8
    });

    const projectsCategory = await Category.create({
      name: 'Projects',
      description: 'Complete projects and assignments',
      icon: 'project-icon.svg',
      isActive: true,
      productCount: 15
    });

    console.log('Categories created');

    // Create products
    const csTextbook = await Product.create({
      title: 'Introduction to Computer Science Textbook',
      description: 'Comprehensive textbook covering all fundamentals of computer science including algorithms, data structures, and programming concepts.',
      price: 45.99,
      category: textbooksCategory._id,
      subcategory: 'Computer Science',
      tags: ['programming', 'algorithms', 'computer science', 'beginner'],
      seller: janeUser._id,
      fileUrl: 'files/intro-cs-textbook.pdf',
      fileName: 'intro-cs-textbook.pdf',
      fileSize: 12500000,
      fileType: 'application/pdf',
      previewImage: 'images/intro-cs-cover.jpg',
      downloads: 87,
      views: 340,
      rating: 4.7,
      numReviews: 24,
      status: 'approved',
      isActive: true
    });

    const calculusNotes = await Product.create({
      title: 'Advanced Calculus Lecture Notes',
      description: 'Detailed lecture notes for advanced calculus covering limits, derivatives, integrals, series, and multivariable calculus.',
      price: 15.99,
      category: notesCategory._id,
      subcategory: 'Mathematics',
      tags: ['calculus', 'mathematics', 'advanced', 'notes'],
      seller: robertUser._id,
      fileUrl: 'files/advanced-calculus-notes.pdf',
      fileName: 'advanced-calculus-notes.pdf',
      fileSize: 5200000,
      fileType: 'application/pdf',
      previewImage: 'images/calculus-notes-cover.jpg',
      downloads: 45,
      views: 190,
      rating: 4.5,
      numReviews: 12,
      status: 'approved',
      isActive: true
    });

    const databaseProject = await Product.create({
      title: 'Database Design Project',
      description: 'Complete database design project with ER diagrams, normalization steps, SQL scripts, and implementation details.',
      price: 29.99,
      category: projectsCategory._id,
      subcategory: 'Database Systems',
      tags: ['database', 'SQL', 'project', 'design'],
      seller: janeUser._id,
      fileUrl: 'files/database-design-project.zip',
      fileName: 'database-design-project.zip',
      fileSize: 8400000,
      fileType: 'application/zip',
      previewImage: 'images/database-project-cover.jpg',
      downloads: 32,
      views: 147,
      rating: 4.8,
      numReviews: 9,
      status: 'approved',
      isActive: true
    });

    const psychologyGuide = await Product.create({
      title: 'Psychology Study Guide',
      description: 'Comprehensive study guide for introductory psychology, covering all major concepts, theories, and key figures.',
      price: 12.99,
      category: guidesCategory._id,
      subcategory: 'Psychology',
      tags: ['psychology', 'study guide', 'exam prep'],
      seller: robertUser._id,
      fileUrl: 'files/psychology-study-guide.pdf',
      fileName: 'psychology-study-guide.pdf',
      fileSize: 3800000,
      fileType: 'application/pdf',
      previewImage: 'images/psychology-guide-cover.jpg',
      downloads: 78,
      views: 253,
      rating: 4.6,
      numReviews: 18,
      status: 'approved',
      isActive: true
    });

    const mlPaper = await Product.create({
      title: 'Machine Learning Research Paper',
      description: 'Original research paper on novel approaches to supervised learning algorithms with implementation examples.',
      price: 18.99,
      category: papersCategory._id,
      subcategory: 'Artificial Intelligence',
      tags: ['machine learning', 'AI', 'research', 'algorithms'],
      seller: janeUser._id,
      fileUrl: 'files/ml-research-paper.pdf',
      fileName: 'ml-research-paper.pdf',
      fileSize: 2100000,
      fileType: 'application/pdf',
      previewImage: 'images/ml-paper-cover.jpg',
      downloads: 41,
      views: 165,
      rating: 4.9,
      numReviews: 7,
      status: 'approved',
      isActive: true
    });

    console.log('Products created');

    // Create orders
    const order1 = await Order.create({
      customer: johnUser._id,
      items: [
        {
          product: csTextbook._id,
          title: 'Introduction to Computer Science Textbook',
          price: 45.99,
          seller: janeUser._id
        }
      ],
      totalAmount: 45.99,
      paymentStatus: 'completed',
      paymentMethod: 'stripe',
      stripePaymentId: 'pi_3NpT7Q2eZvKYlo2C1KGZf7Sg',
      orderStatus: 'completed',
      completedAt: new Date('2023-07-15T14:30:00Z')
    });

    const order2 = await Order.create({
      customer: sarahUser._id,
      items: [
        {
          product: calculusNotes._id,
          title: 'Advanced Calculus Lecture Notes',
          price: 15.99,
          seller: robertUser._id
        },
        {
          product: psychologyGuide._id,
          title: 'Psychology Study Guide',
          price: 12.99,
          seller: robertUser._id
        }
      ],
      totalAmount: 28.98,
      paymentStatus: 'completed',
      paymentMethod: 'stripe',
      stripePaymentId: 'pi_3NqR8Z2eZvKYlo2C0JyKl9Tp',
      orderStatus: 'completed',
      completedAt: new Date('2023-08-02T09:45:00Z')
    });

    const order3 = await Order.create({
      customer: johnUser._id,
      items: [
        {
          product: databaseProject._id,
          title: 'Database Design Project',
          price: 29.99,
          seller: janeUser._id
        }
      ],
      totalAmount: 29.99,
      paymentStatus: 'completed',
      paymentMethod: 'stripe',
      stripePaymentId: 'pi_3NsT9X2eZvKYlo2C0KpMb3Rx',
      orderStatus: 'completed',
      completedAt: new Date('2023-08-15T16:20:00Z')
    });

    const order4 = await Order.create({
      customer: sarahUser._id,
      items: [
        {
          product: mlPaper._id,
          title: 'Machine Learning Research Paper',
          price: 18.99,
          seller: janeUser._id
        }
      ],
      totalAmount: 18.99,
      paymentStatus: 'pending',
      paymentMethod: 'stripe',
      stripePaymentId: null,
      orderStatus: 'processing',
      completedAt: null
    });

    console.log('Orders created');

    // Create reviews
    await Review.create({
      product: csTextbook._id,
      user: johnUser._id,
      rating: 5,
      comment: 'Excellent textbook with clear explanations and helpful examples. Perfect for beginners!',
      isVerifiedPurchase: true
    });

    await Review.create({
      product: calculusNotes._id,
      user: sarahUser._id,
      rating: 4,
      comment: 'Very comprehensive notes, though some sections could use more examples.',
      isVerifiedPurchase: true
    });

    await Review.create({
      product: psychologyGuide._id,
      user: sarahUser._id,
      rating: 5,
      comment: 'This study guide helped me ace my exam! Very well organized and covers all important topics.',
      isVerifiedPurchase: true
    });

    await Review.create({
      product: databaseProject._id,
      user: johnUser._id,
      rating: 5,
      comment: 'Great project template with excellent documentation. Saved me so much time!',
      isVerifiedPurchase: true
    });

    await Review.create({
      product: csTextbook._id,
      user: sarahUser._id,
      rating: 4,
      comment: 'Very informative textbook. The exercises at the end of each chapter are especially helpful.',
      isVerifiedPurchase: false
    });

    console.log('Reviews created');

    console.log('Database seeding completed successfully!');
    
    // Close the connection
    mongoose.connection.close();
    
  } catch (error) {
    console.error(`Error seeding database: ${error}`);
    process.exit(1);
  }
};

// Execute the seeding function
seedDatabase();
