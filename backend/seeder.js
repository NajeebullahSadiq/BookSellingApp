const mongoose = require('mongoose');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Import models
const User = require('./models/User');
const Category = require('./models/Category');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Review = require('./models/Review');
const Blog = require('./models/Blog');

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

    const uploadsProductsDir = path.join(__dirname, 'uploads', 'products');
    if (!fs.existsSync(uploadsProductsDir)) {
      fs.mkdirSync(uploadsProductsDir, { recursive: true });
    }

    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    const randFloat = (min, max) => Math.round((min + Math.random() * (max - min)) * 100) / 100;
    const slugify = (value) => {
      return String(value)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    };
    const getInternetImageUrl = (seed, width = 800, height = 600) => {
      return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${width}/${height}`;
    };
    const writePdfPlaceholder = (absolutePath, title) => {
      const content = Buffer.from(
        `%PDF-1.4\n%\u00e2\u00e3\u00cf\u00d3\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n4 0 obj\n<< /Length 88 >>\nstream\nBT\n/F1 24 Tf\n72 720 Td\n(${String(title).replace(/\(|\)/g, '')}) Tj\nET\nendstream\nendobj\n5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\nxref\n0 6\n0000000000 65535 f\ntrailer\n<< /Root 1 0 R /Size 6 >>\nstartxref\n0\n%%EOF\n`,
        'utf8'
      );
      fs.writeFileSync(absolutePath, content);
      return content.length;
    };

    // Clear existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    await Review.deleteMany({});
    await Blog.deleteMany({});

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
    const productSubcategories = {
      [textbooksCategory._id.toString()]: ['Computer Science', 'Business', 'Engineering', 'Biology', 'Economics', 'Law'],
      [notesCategory._id.toString()]: ['Mathematics', 'Physics', 'Chemistry', 'History', 'English', 'Statistics'],
      [guidesCategory._id.toString()]: ['Psychology', 'Exam Prep', 'GRE', 'IELTS', 'Research Methods'],
      [papersCategory._id.toString()]: ['Artificial Intelligence', 'Data Science', 'Networks', 'Security', 'HCI'],
      [projectsCategory._id.toString()]: ['Database Systems', 'Web Development', 'Mobile Apps', 'Machine Learning', 'DevOps']
    };

    const categories = [
      textbooksCategory,
      notesCategory,
      guidesCategory,
      papersCategory,
      projectsCategory
    ];
    const sellers = [janeUser._id, robertUser._id];

    const specialProductObjectId = new mongoose.Types.ObjectId('6949529122cc4e8637ee03ab');
    const specialTitle = 'Download Test Product (Seeded)';
    const specialFileBasename = 'product-6949529122cc4e8637ee03ab.pdf';
    const specialAbsoluteFilePath = path.join(uploadsProductsDir, specialFileBasename);
    const specialFileSize = writePdfPlaceholder(specialAbsoluteFilePath, specialTitle);

    const productsToInsert = [];
    productsToInsert.push({
      _id: specialProductObjectId,
      title: specialTitle,
      description: 'Seeded product to test the download endpoint. This file is generated locally by seeder.js.',
      price: 9.99,
      category: textbooksCategory._id,
      subcategory: 'Computer Science',
      tags: ['download', 'test', 'seed'],
      seller: janeUser._id,
      fileUrl: path.posix.join('uploads', 'products', specialFileBasename),
      fileName: specialFileBasename,
      fileSize: specialFileSize,
      fileType: 'application/pdf',
      previewImage: getInternetImageUrl('seed-special-product', 800, 1100),
      downloads: randInt(0, 20),
      views: randInt(10, 200),
      rating: randFloat(4.0, 5.0),
      numReviews: randInt(0, 15),
      status: 'approved',
      isActive: true,
      previewPages: [],
      previewPagesCount: 0
    });

    const adjectives = ['Advanced', 'Complete', 'Practical', 'Modern', 'Essential', 'Ultimate', 'Quick', 'Master', 'Hands-On'];
    const subjects = ['Algorithms', 'Calculus', 'Psychology', 'Databases', 'Machine Learning', 'Physics', 'Statistics', 'Marketing', 'Economics', 'Cybersecurity'];
    const formats = ['Guide', 'Notes', 'Workbook', 'Project', 'Cheat Sheet', 'Textbook', 'Case Study', 'Tutorial'];
    const tagPool = ['study', 'exam', 'university', 'assignment', 'pdf', 'reference', 'beginner', 'advanced', 'practice'];

    const totalProducts = 300;
    const remaining = totalProducts - 1;
    for (let i = 0; i < remaining; i++) {
      const categoryObj = pick(categories);
      const categoryIdStr = categoryObj._id.toString();
      const subcategory = pick(productSubcategories[categoryIdStr] || ['General']);

      const title = `${pick(adjectives)} ${pick(subjects)} ${pick(formats)} #${i + 1}`;
      const baseSlug = slugify(title);
      const fileBasename = `${baseSlug}.pdf`;
      const absoluteFilePath = path.join(uploadsProductsDir, fileBasename);
      const fileSize = writePdfPlaceholder(absoluteFilePath, title);

      productsToInsert.push({
        title,
        description: `High-quality ${subcategory} resource for students. Includes clear explanations, examples, and practice questions.`,
        price: randFloat(4.99, 59.99),
        category: categoryObj._id,
        subcategory,
        tags: Array.from(new Set([pick(tagPool), pick(tagPool), pick(tagPool), subcategory.toLowerCase()])),
        seller: pick(sellers),
        fileUrl: path.posix.join('uploads', 'products', fileBasename),
        fileName: fileBasename,
        fileSize,
        fileType: 'application/pdf',
        previewImage: getInternetImageUrl(`product-${baseSlug}`, 800, 1100),
        downloads: randInt(0, 250),
        views: randInt(20, 1200),
        rating: randFloat(3.5, 5.0),
        numReviews: randInt(0, 60),
        status: 'approved',
        isActive: true,
        previewPages: [],
        previewPagesCount: 0
      });
    }

    const createdProducts = await Product.insertMany(productsToInsert);
    const csTextbook = createdProducts.find((p) => p._id.toString() === specialProductObjectId.toString());
    const calculusNotes = createdProducts[1];
    const databaseProject = createdProducts[2];
    const psychologyGuide = createdProducts[3];
    const mlPaper = createdProducts[4];

    console.log('Products created');

    // Create orders
    const order1 = await Order.create({
      customer: johnUser._id,
      items: [
        {
          product: csTextbook._id,
          title: csTextbook.title,
          price: csTextbook.price,
          seller: janeUser._id
        }
      ],
      totalAmount: csTextbook.price,
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
          title: calculusNotes.title,
          price: calculusNotes.price,
          seller: calculusNotes.seller
        },
        {
          product: psychologyGuide._id,
          title: psychologyGuide.title,
          price: psychologyGuide.price,
          seller: psychologyGuide.seller
        }
      ],
      totalAmount: Math.round((calculusNotes.price + psychologyGuide.price) * 100) / 100,
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
          title: databaseProject.title,
          price: databaseProject.price,
          seller: databaseProject.seller
        }
      ],
      totalAmount: databaseProject.price,
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
          title: mlPaper.title,
          price: mlPaper.price,
          seller: mlPaper.seller
        }
      ],
      totalAmount: mlPaper.price,
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

    const blogCategories = ['tips', 'guides', 'news', 'resources', 'tutorials', 'updates'];
    const blogTagsPool = ['students', 'productivity', 'study', 'exams', 'notes', 'books', 'research', 'writing', 'career', 'learning'];
    const blogsToInsert = [];
    for (let i = 0; i < 30; i++) {
      const title = `${pick(adjectives)} Study Tips for ${pick(subjects)} (${i + 1})`;
      const slug = `${slugify(title)}-${i + 1}`;
      const excerpt = `A short guide to help you learn ${pick(subjects)} faster with practical strategies and resources.`;
      const content = `This article covers practical strategies to improve your learning in ${pick(subjects)}.\n\n` +
        `1) Plan your week\n2) Use active recall\n3) Practice with examples\n4) Review your mistakes\n\n` +
        `Recommended resources and templates are included.`;
      const wordCount = content.split(/\s+/).filter(Boolean).length;
      const readingTime = Math.max(1, Math.ceil(wordCount / 200));

      const relatedCount = randInt(0, 3);
      const relatedProducts = [];
      for (let j = 0; j < relatedCount; j++) {
        relatedProducts.push(pick(createdProducts)._id);
      }

      blogsToInsert.push({
        title,
        slug,
        excerpt,
        content,
        featuredImage: getInternetImageUrl(`blog-${slug}`, 1200, 630),
        author: adminUser._id,
        category: pick(blogCategories),
        tags: Array.from(new Set([pick(blogTagsPool), pick(blogTagsPool), pick(blogTagsPool)])),
        metaTitle: title,
        metaDescription: excerpt,
        metaKeywords: Array.from(new Set([pick(blogTagsPool), pick(blogTagsPool), pick(blogTagsPool)])),
        status: 'published',
        publishedAt: new Date(Date.now() - randInt(1, 90) * 24 * 60 * 60 * 1000),
        views: randInt(0, 5000),
        readingTime,
        relatedProducts: Array.from(new Set(relatedProducts.map((id) => id.toString()))).map((id) => new mongoose.Types.ObjectId(id))
      });
    }

    await Blog.insertMany(blogsToInsert);

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
