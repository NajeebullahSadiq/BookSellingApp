import { useState, useEffect } from 'react';
import { productAPI } from '../../utils/api';

const AdvancedFilters = ({ filters, onFilterChange, categories }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [sellers, setSellers] = useState([]);
  const [loadingSellers, setLoadingSellers] = useState(false);

  useEffect(() => {
    fetchSellers();
  }, []);

  const fetchSellers = async () => {
    try {
      setLoadingSellers(true);
      const { data } = await productAPI.getAll({ limit: 1000 });
      const uniqueSellers = [];
      const sellerIds = new Set();
      
      data.data.forEach(product => {
        if (product.seller && !sellerIds.has(product.seller._id)) {
          sellerIds.add(product.seller._id);
          uniqueSellers.push({
            _id: product.seller._id,
            name: product.seller.name
          });
        }
      });
      
      setSellers(uniqueSellers);
    } catch (error) {
      console.error('Failed to fetch sellers');
    } finally {
      setLoadingSellers(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({ ...filters, [name]: value, page: 1 });
  };

  const handleReset = () => {
    onFilterChange({
      search: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      minRating: '',
      seller: '',
      sortBy: 'latest',
      page: 1
    });
  };

  const hasActiveFilters = filters.category || filters.minPrice || filters.maxPrice || filters.minRating || filters.seller;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
          {hasActiveFilters && (
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              Active
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear All
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-600 hover:text-gray-800"
          >
            <svg
              className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              name="category"
              value={filters.category}
              onChange={handleChange}
              className="input-field w-full"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price Range
            </label>
            <div className="flex space-x-2">
              <input
                type="number"
                name="minPrice"
                placeholder="Min"
                value={filters.minPrice}
                onChange={handleChange}
                className="input-field w-full"
                min="0"
              />
              <input
                type="number"
                name="maxPrice"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={handleChange}
                className="input-field w-full"
                min="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Rating
            </label>
            <select
              name="minRating"
              value={filters.minRating}
              onChange={handleChange}
              className="input-field w-full"
            >
              <option value="">All Ratings</option>
              <option value="4.5">⭐ 4.5 & up</option>
              <option value="4.0">⭐ 4.0 & up</option>
              <option value="3.5">⭐ 3.5 & up</option>
              <option value="3.0">⭐ 3.0 & up</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seller
            </label>
            <select
              name="seller"
              value={filters.seller}
              onChange={handleChange}
              className="input-field w-full"
              disabled={loadingSellers}
            >
              <option value="">All Sellers</option>
              {sellers.map((seller) => (
                <option key={seller._id} value={seller._id}>
                  {seller.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              name="sortBy"
              value={filters.sortBy}
              onChange={handleChange}
              className="input-field w-full"
            >
              <option value="latest">Latest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedFilters;
