import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { blogAPI } from '../../utils/api';

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    search: '',
    page: 1,
    limit: 9
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0
  });

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'tips', label: 'Tips' },
    { value: 'guides', label: 'Guides' },
    { value: 'news', label: 'News' },
    { value: 'resources', label: 'Resources' },
    { value: 'tutorials', label: 'Tutorials' },
    { value: 'updates', label: 'Updates' }
  ];

  useEffect(() => {
    fetchBlogs();
  }, [filters]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        status: 'published'
      };
      const response = await blogAPI.getAll(params);
      setBlogs(response.data.data);
      setPagination({
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages,
        total: response.data.total
      });
    } catch (error) {
      console.error('Failed to fetch blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters({ ...filters, page: 1 });
  };

  const handleCategoryChange = (category) => {
    setFilters({ ...filters, category, page: 1 });
  };

  const handlePageChange = (page) => {
    setFilters({ ...filters, page });
    window.scrollTo(0, 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Blog & Resources</h1>
          <p className="text-xl">Tips, guides, and resources to help you succeed</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 space-y-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              placeholder="Search articles..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button type="submit" className="btn-primary px-6">
              Search
            </button>
          </form>

          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => handleCategoryChange(cat.value)}
                className={`px-4 py-2 rounded-full font-medium transition ${
                  filters.category === cat.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-xl">No blog posts found</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {blogs.map((blog) => (
                <Link
                  key={blog._id}
                  to={`/blog/${blog.slug}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition group"
                >
                  {blog.featuredImage && (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={blog.featuredImage}
                        alt={blog.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-3 py-1 bg-blue-100 text-blue-600 text-xs font-medium rounded-full uppercase">
                        {blog.category}
                      </span>
                      <span className="text-sm text-gray-500">{blog.readingTime} min read</span>
                    </div>
                    <h2 className="text-xl font-bold mb-2 text-gray-800 group-hover:text-blue-600 transition">
                      {blog.title}
                    </h2>
                    <p className="text-gray-600 mb-4 line-clamp-3">{blog.excerpt}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{formatDate(blog.publishedAt)}</span>
                      <span>{blog.views} views</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                {[...Array(pagination.totalPages)].map((_, idx) => (
                  <button
                    key={idx + 1}
                    onClick={() => handlePageChange(idx + 1)}
                    className={`px-4 py-2 border rounded-lg ${
                      pagination.currentPage === idx + 1
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BlogList;
