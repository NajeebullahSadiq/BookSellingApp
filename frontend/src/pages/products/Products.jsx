import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { setLoading, setProducts } from '../../store/slices/productSlice';
import { addToCart } from '../../store/slices/cartSlice';
import { productAPI, categoryAPI } from '../../utils/api';

const Products = () => {
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    minPrice: '',
    maxPrice: '',
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

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value, page: 1 });
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
    window.scrollTo(0, 0);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Browse Products</h1>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 card">
        <input
          type="text"
          name="search"
          placeholder="Search products..."
          className="input-field"
          value={filters.search}
          onChange={handleFilterChange}
        />

        <select name="category" className="input-field" value={filters.category} onChange={handleFilterChange}>
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat._id} value={cat._id}>{cat.name}</option>
          ))}
        </select>

        <select name="sortBy" className="input-field" value={filters.sortBy} onChange={handleFilterChange}>
          <option value="latest">Latest</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="rating">Top Rated</option>
          <option value="popular">Most Popular</option>
        </select>

        <div className="flex space-x-2">
          <input
            type="number"
            name="minPrice"
            placeholder="Min $"
            className="input-field"
            value={filters.minPrice}
            onChange={handleFilterChange}
          />
          <input
            type="number"
            name="maxPrice"
            placeholder="Max $"
            className="input-field"
            value={filters.maxPrice}
            onChange={handleFilterChange}
          />
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-12">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No products found</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product._id} className="card hover:shadow-lg transition-shadow">
                <Link to={`/products/${product._id}`}>
                  {product.previewImage ? (
                    <img
                      src={`http://localhost:5000${product.previewImage}`}
                      alt={product.title}
                      className="w-full h-48 object-cover rounded-t-lg mb-4"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 rounded-t-lg mb-4 flex items-center justify-center text-4xl">
                      📄
                    </div>
                  )}
                </Link>

                <Link to={`/products/${product._id}`}>
                  <h3 className="font-semibold text-lg mb-2 hover:text-blue-600 line-clamp-2">
                    {product.title}
                  </h3>
                </Link>

                <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>

                <div className="flex items-center justify-between mb-3">
                  <span className="text-xl font-bold text-blue-600">${product.price}</span>
                  <span className="text-sm text-gray-500">⭐ {product.rating.toFixed(1)}</span>
                </div>

                <div className="flex space-x-2">
                  <Link to={`/products/${product._id}`} className="btn-secondary flex-1 text-center text-sm">
                    View Details
                  </Link>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="btn-primary flex-1 text-sm"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8 space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 border rounded disabled:opacity-50"
              >
                Previous
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => handlePageChange(i + 1)}
                  className={`px-4 py-2 border rounded ${currentPage === i + 1 ? 'bg-blue-600 text-white' : ''}`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Products;
