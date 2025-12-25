const Blog = require('../models/Blog');
const fs = require('fs');
const path = require('path');

 const normalizeRelatedProducts = (value) => {
   if (value === undefined) return undefined;
   if (value === null) return [];

   if (Array.isArray(value)) {
     if (
       value.length === 1 &&
       typeof value[0] === 'string' &&
       value[0].trim().startsWith('[')
     ) {
       try {
         const parsed = JSON.parse(value[0]);
         return Array.isArray(parsed) ? parsed : [];
       } catch (e) {
         return value;
       }
     }
     return value;
   }

   if (typeof value === 'string') {
     const trimmed = value.trim();
     if (!trimmed) return [];

     if (trimmed.startsWith('[')) {
       try {
         const parsed = JSON.parse(trimmed);
         return Array.isArray(parsed) ? parsed : [];
       } catch (e) {
         return [trimmed];
       }
     }

     if (trimmed.includes(',')) {
       return trimmed
         .split(',')
         .map((v) => v.trim())
         .filter(Boolean);
     }

     return [trimmed];
   }

   return [];
 };

exports.createBlog = async (req, res) => {
  try {
    const { 
      title, 
      slug, 
      excerpt, 
      content, 
      category, 
      tags, 
      metaTitle, 
      metaDescription, 
      metaKeywords,
      relatedProducts,
      status 
    } = req.body;

    const existingSlug = await Blog.findOne({ slug });
    if (existingSlug) {
      return res.status(400).json({
        success: false,
        message: 'Slug already exists'
      });
    }

    const featuredImage = req.file ? `/uploads/images/${req.file.filename}` : null;

    const wordCount = content.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200);

    const blog = await Blog.create({
      title,
      slug,
      excerpt,
      content,
      featuredImage,
      author: req.user._id,
      category,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
      metaTitle: metaTitle || title,
      metaDescription: metaDescription || excerpt,
      metaKeywords: metaKeywords ? (Array.isArray(metaKeywords) ? metaKeywords : metaKeywords.split(',').map(k => k.trim())) : [],
      relatedProducts: normalizeRelatedProducts(relatedProducts) || [],
      readingTime,
      status: status || 'draft',
      publishedAt: status === 'published' ? new Date() : null
    });

    res.status(201).json({
      success: true,
      data: blog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getBlogs = async (req, res) => {
  try {
    const {
      category,
      search,
      tag,
      status,
      page = 1,
      limit = 10
    } = req.query;

    let query = {};

    if (status) {
      query.status = status;
    } else {
      query.status = 'published';
    }

    if (category) {
      query.category = category;
    }

    if (tag) {
      query.tags = tag;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    const blogs = await Blog.find(query)
      .populate('author', 'name')
      .populate('relatedProducts', 'title price previewImage')
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Blog.countDocuments(query);

    res.status(200).json({
      success: true,
      data: blogs,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      total: count
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug })
      .populate('author', 'name')
      .populate('relatedProducts', 'title price previewImage rating numReviews');

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    blog.views += 1;
    await blog.save();

    res.status(200).json({
      success: true,
      data: blog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('author', 'name')
      .populate('relatedProducts', 'title price previewImage');

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    res.status(200).json({
      success: true,
      data: blog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateBlog = async (req, res) => {
  try {
    let blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this blog post'
      });
    }

    const { 
      title, 
      slug, 
      excerpt, 
      content, 
      category, 
      tags, 
      metaTitle, 
      metaDescription, 
      metaKeywords,
      relatedProducts,
      status 
    } = req.body;

    if (slug && slug !== blog.slug) {
      const existingSlug = await Blog.findOne({ slug });
      if (existingSlug) {
        return res.status(400).json({
          success: false,
          message: 'Slug already exists'
        });
      }
    }

    const featuredImage = req.file ? `/uploads/images/${req.file.filename}` : blog.featuredImage;

    if (req.file && blog.featuredImage) {
      const oldImagePath = path.join(__dirname, '..', blog.featuredImage);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    let readingTime = blog.readingTime;
    if (content) {
      const wordCount = content.split(/\s+/).length;
      readingTime = Math.ceil(wordCount / 200);
    }

    const wasPublishing = blog.status !== 'published' && status === 'published';

    const normalizedRelatedProducts = normalizeRelatedProducts(relatedProducts);

    blog = await Blog.findByIdAndUpdate(
      req.params.id,
      {
        title: title || blog.title,
        slug: slug || blog.slug,
        excerpt: excerpt || blog.excerpt,
        content: content || blog.content,
        featuredImage,
        category: category || blog.category,
        tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : blog.tags,
        metaTitle: metaTitle || blog.metaTitle,
        metaDescription: metaDescription || blog.metaDescription,
        metaKeywords: metaKeywords ? (Array.isArray(metaKeywords) ? metaKeywords : metaKeywords.split(',').map(k => k.trim())) : blog.metaKeywords,
        relatedProducts: normalizedRelatedProducts === undefined ? blog.relatedProducts : normalizedRelatedProducts,
        readingTime,
        status: status || blog.status,
        publishedAt: wasPublishing ? new Date() : blog.publishedAt
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: blog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this blog post'
      });
    }

    if (blog.featuredImage) {
      const imagePath = path.join(__dirname, '..', blog.featuredImage);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await blog.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Blog post deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getRelatedBlogs = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    const relatedBlogs = await Blog.find({
      _id: { $ne: blog._id },
      status: 'published',
      $or: [
        { category: blog.category },
        { tags: { $in: blog.tags } }
      ]
    })
      .populate('author', 'name')
      .sort({ publishedAt: -1 })
      .limit(3);

    res.status(200).json({
      success: true,
      data: relatedBlogs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
