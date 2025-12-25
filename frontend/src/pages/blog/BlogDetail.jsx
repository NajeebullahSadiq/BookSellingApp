import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { blogAPI } from '../../utils/api';
import { Helmet } from 'react-helmet-async';

const BlogDetail = () => {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlog();
  }, [slug]);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      const response = await blogAPI.getBySlug(slug);
      setBlog(response.data.data);
      
      if (response.data.data._id) {
        const relatedResponse = await blogAPI.getRelated(response.data.data._id);
        setRelatedBlogs(relatedResponse.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch blog:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Blog post not found</h1>
          <Link to="/blog" className="text-blue-600 hover:underline">
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{blog.metaTitle || blog.title}</title>
        <meta name="description" content={blog.metaDescription || blog.excerpt} />
        <meta name="keywords" content={blog.metaKeywords?.join(', ')} />
        <meta property="og:title" content={blog.metaTitle || blog.title} />
        <meta property="og:description" content={blog.metaDescription || blog.excerpt} />
        {blog.featuredImage && <meta property="og:image" content={blog.featuredImage} />}
        <meta property="og:type" content="article" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link to="/blog" className="text-blue-600 hover:underline mb-6 inline-block">
            ← Back to Blog
          </Link>

          <header className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-blue-100 text-blue-600 text-sm font-medium rounded-full uppercase">
                {blog.category}
              </span>
              <span className="text-gray-500">{blog.readingTime} min read</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {blog.title}
            </h1>

            <div className="flex items-center gap-4 text-gray-600">
              <span>By {blog.author?.name}</span>
              <span>•</span>
              <time dateTime={blog.publishedAt}>{formatDate(blog.publishedAt)}</time>
              <span>•</span>
              <span>{blog.views} views</span>
            </div>

            {blog.tags && blog.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {blog.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          {blog.featuredImage && (
            <div className="mb-8 rounded-lg overflow-hidden">
              <img
                src={blog.featuredImage}
                alt={blog.title}
                className="w-full h-auto"
              />
            </div>
          )}

          <div 
            className="prose prose-lg max-w-none mb-12"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />

          {blog.relatedProducts && blog.relatedProducts.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-6 mb-12">
              <h3 className="text-xl font-bold mb-4">Related Products</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {blog.relatedProducts.map((product) => (
                  <Link
                    key={product._id}
                    to={`/products/${product._id}`}
                    className="bg-white rounded-lg p-4 hover:shadow-md transition"
                  >
                    {product.previewImage && (
                      <img
                        src={product.previewImage}
                        alt={product.title}
                        className="w-full h-32 object-cover rounded mb-2"
                      />
                    )}
                    <h4 className="font-semibold text-gray-800 mb-1 line-clamp-2">
                      {product.title}
                    </h4>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-600 font-bold">${product.price}</span>
                      {product.rating > 0 && (
                        <span className="text-sm text-gray-500">
                          ⭐ {product.rating} ({product.numReviews})
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </article>

        {relatedBlogs.length > 0 && (
          <div className="bg-white py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold mb-8">Related Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {relatedBlogs.map((relatedBlog) => (
                  <Link
                    key={relatedBlog._id}
                    to={`/blog/${relatedBlog.slug}`}
                    className="bg-gray-50 rounded-lg overflow-hidden hover:shadow-lg transition group"
                  >
                    {relatedBlog.featuredImage && (
                      <div className="h-40 overflow-hidden">
                        <img
                          src={relatedBlog.featuredImage}
                          alt={relatedBlog.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs font-medium rounded-full uppercase">
                        {relatedBlog.category}
                      </span>
                      <h3 className="text-lg font-bold mt-2 mb-1 group-hover:text-blue-600 transition">
                        {relatedBlog.title}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {relatedBlog.excerpt}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default BlogDetail;
