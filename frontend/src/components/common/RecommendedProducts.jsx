import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { addToCart } from '../../store/slices/cartSlice';
import WishlistButton from './WishlistButton';
import VerificationBadge from './VerificationBadge';

const RecommendedProducts = ({ products, title = 'Recommended for You', loading = false }) => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const handleAddToCart = (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }
    dispatch(addToCart(product));
    toast.success('Added to cart!');
  };

  if (loading) {
    return (
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">{title}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="card animate-pulse">
              <div className="w-full h-32 bg-gray-300 rounded mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-6">{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {products.map((product) => (
          <Link
            to={`/products/${product._id}`}
            key={product._id}
            className="card hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 relative group"
          >
            <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
              <WishlistButton productId={product._id} size="sm" />
            </div>

            {product.previewImage ? (
              <img
                src={`${import.meta.env.VITE_API_URL}${product.previewImage}`}
                alt={product.title}
                className="w-full h-32 object-cover rounded-t-lg mb-2"
              />
            ) : (
              <div className="w-full h-32 bg-gradient-to-br from-blue-100 to-blue-200 rounded-t-lg mb-2 flex items-center justify-center text-3xl">
                📚
              </div>
            )}

            <h3 className="font-semibold text-sm mb-1 line-clamp-2 min-h-[2.5rem]">
              {product.title}
            </h3>

            <div className="flex items-center gap-1 mb-1">
              <p className="text-xs text-gray-500 truncate">
                by {product.seller?.name || 'Unknown'}
              </p>
              <VerificationBadge seller={product.seller} size="xs" />
            </div>

            <div className="flex items-center justify-between mb-2">
              <span className="text-lg font-bold text-blue-600">
                ${product.price.toFixed(2)}
              </span>
              <div className="flex items-center space-x-1">
                <span className="text-yellow-400 text-sm">⭐</span>
                <span className="text-xs font-semibold text-gray-700">
                  {product.rating.toFixed(1)}
                </span>
              </div>
            </div>

            <button
              onClick={(e) => handleAddToCart(product, e)}
              className="w-full btn-primary text-xs py-2 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              Add to Cart
            </button>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RecommendedProducts;
