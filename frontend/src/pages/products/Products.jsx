import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { setLoading, setProducts } from '../../store/slices/productSlice';
import { addToCart } from '../../store/slices/cartSlice';
import { productAPI, categoryAPI } from '../../utils/api';
import SearchBar from '../../components/common/SearchBar';
import AdvancedFilters from '../../components/common/AdvancedFilters';
import WishlistButton from '../../components/common/WishlistButton';
import VerificationBadge from '../../components/common/VerificationBadge';
import SocialShareButton from '../../components/common/SocialShareButton';

const Products = () => {
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    minRating: '',
    seller: '',
    sortBy: 'latest',
    page: 1
  });

  const dispatch = useDispatch();
  const { products, loading, totalPages, currentPage } = useSelector((state) => state.products);
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchCategories = async () => {
    try {
      const { data } = await categoryAPI.getAll();
      setCategories(data.data);
    } catch (error) {
      console.error('Failed to fetch categories');
    }
  };

  const fetchProducts = async () => {
    try {
      dispatch(setLoading(true));
      const { data } = await productAPI.getAll(filters);
      dispatch(setProducts({
        products: data.data,
        totalPages: data.totalPages,
        currentPage: data.currentPage
      }));
    } catch (error) {
      toast.error('Failed to fetch products');
    }
  };

  const handleSearchChange = useCallback((searchValue) => {
    setFilters((prev) => ({ ...prev, search: searchValue, page: 1 }));
  }, []);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleAddToCart = (product) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }
    dispatch(addToCart(product));
    toast.success('Added to cart!');
  };

  const handlePageChange = (newPage) => {
    setFilters({ ...filters, page: newPage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Products</h1>
          <p className="text-gray-600">
            Discover thousands of books, study materials, and academic resources
          </p>
        </div>

        <div className="mb-6">
          <SearchBar
            value={filters.search}
            onChange={handleSearchChange}
            placeholder="Search by title, description, or tags..."
          />
        </div>

        <AdvancedFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          categories={categories}
        />

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="card animate-pulse">
                <div className="w-full h-48 bg-gray-300 rounded-t-lg mb-4"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
                <div className="flex justify-between mb-4">
                  <div className="h-6 bg-gray-300 rounded w-16"></div>
                  <div className="h-6 bg-gray-300 rounded w-12"></div>
                </div>
                <div className="flex space-x-2">
                  <div className="h-8 bg-gray-300 rounded flex-1"></div>
                  <div className="h-8 bg-gray-300 rounded flex-1"></div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm">
            <svg
              className="mx-auto h-24 w-24 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500 mb-6">
              Try adjusting your search or filter criteria
            </p>
            <button
              onClick={() => handleFilterChange({
                search: '',
                category: '',
                minPrice: '',
                maxPrice: '',
                minRating: '',
                seller: '',
                sortBy: 'latest',
                page: 1
              })}
              className="btn-primary"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-gray-600">
                Showing <span className="font-semibold">{products.length}</span> products
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <div
                  key={product._id}
                  className="card hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative"
                >
                  <div className="absolute top-2 right-2 z-10 flex gap-2">
                    <SocialShareButton product={product} variant="icon" size="sm" />
                    <WishlistButton productId={product._id} size="md" />
                  </div>

                  <Link to={`/products/${product._id}`}>
                    {product.previewImage ? (
                      <img
                        src={`${import.meta.env.VITE_API_URL}${product.previewImage}`}
                        alt={product.title}
                        className="w-full h-48 object-cover rounded-t-lg mb-4"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-blue-200 rounded-t-lg mb-4 flex items-center justify-center text-5xl">
                        📚
                      </div>
                    )}
                  </Link>

                  <Link to={`/products/${product._id}`}>
                    <h3 className="font-semibold text-lg mb-2 hover:text-blue-600 line-clamp-2 min-h-[3.5rem]">
                      {product.title}
                    </h3>
                  </Link>

                  <p className="text-gray-600 text-sm mb-3 line-clamp-2 min-h-[2.5rem]">
                    {product.description}
                  </p>

                  <div className="mb-3">
                    <div className="flex items-center gap-1 mb-1">
                      <p className="text-xs text-gray-500">
                        by {product.seller?.name || 'Unknown'}
                      </p>
                      <VerificationBadge seller={product.seller} size="xs" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-blue-600">
                        ${product.price.toFixed(2)}
                      </span>
                      <div className="flex items-center space-x-1">
                        <span className="text-yellow-400">⭐</span>
                        <span className="text-sm font-semibold text-gray-700">
                          {product.rating.toFixed(1)}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({product.numReviews})
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Link
                      to={`/products/${product._id}`}
                      className="btn-secondary flex-1 text-center text-sm py-2"
                    >
                      View Details
                    </Link>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="btn-primary flex-1 text-sm py-2"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-8 space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>
                
                <div className="flex space-x-1">
                  {[...Array(Math.min(totalPages, 7))].map((_, i) => {
                    let pageNum;
                    if (totalPages <= 7) {
                      pageNum = i + 1;
                    } else if (currentPage <= 4) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 3) {
                      pageNum = totalPages - 6 + i;
                    } else {
                      pageNum = currentPage - 3 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-4 py-2 border rounded-md transition-colors ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
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

export default Products;
