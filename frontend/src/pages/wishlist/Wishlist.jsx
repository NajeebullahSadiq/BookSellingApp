import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { setWishlistLoading, setWishlist, removeFromWishlist as removeFromWishlistAction } from '../../store/slices/wishlistSlice';
import { addToCart } from '../../store/slices/cartSlice';
import { wishlistAPI } from '../../utils/api';
import SocialShareButton from '../../components/common/SocialShareButton';

const Wishlist = () => {
  const resolveImageUrl = (url) => {
    if (!url) return url;
    if (/^https?:\/\//i.test(url)) return url;
    const base = import.meta.env.VITE_API_URL || '';
    const normalized = url.startsWith('/') ? url : `/${url}`;
    return `${base}${normalized}`;
  };

  const dispatch = useDispatch();
  const { items, loading } = useSelector((state) => state.wishlist);
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    }
  }, [isAuthenticated]);

  const fetchWishlist = async () => {
    try {
      dispatch(setWishlistLoading(true));
      const { data } = await wishlistAPI.getWishlist();
      dispatch(setWishlist(data.data));
    } catch (error) {
      toast.error('Failed to fetch wishlist');
      dispatch(setWishlistLoading(false));
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    try {
      await wishlistAPI.removeFromWishlist(productId);
      dispatch(removeFromWishlistAction(productId));
      toast.success('Removed from wishlist');
    } catch (error) {
      toast.error('Failed to remove from wishlist');
    }
  };

  const handleAddToCart = (product) => {
    dispatch(addToCart(product));
    toast.success('Added to cart!');
  };

  const handleClearWishlist = async () => {
    if (window.confirm('Are you sure you want to clear your entire wishlist?')) {
      try {
        await wishlistAPI.clearWishlist();
        dispatch(setWishlist([]));
        toast.success('Wishlist cleared');
      } catch (error) {
        toast.error('Failed to clear wishlist');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="card">
                  <div className="w-full h-48 bg-gray-300 rounded mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
                  <div className="h-8 bg-gray-300 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wishlist</h1>
            <p className="text-gray-600">
              {items.length} {items.length === 1 ? 'item' : 'items'} saved
            </p>
          </div>
          {items.length > 0 && (
            <button
              onClick={handleClearWishlist}
              className="text-red-600 hover:text-red-800 font-medium"
            >
              Clear All
            </button>
          )}
        </div>

        {items.length === 0 ? (
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
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Your wishlist is empty
            </h3>
            <p className="text-gray-500 mb-6">
              Start adding products you love to your wishlist
            </p>
            <Link to="/products" className="btn-primary inline-block">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((product) => (
              <div
                key={product._id}
                className="card hover:shadow-xl transition-all duration-300 relative group"
              >
                <div className="absolute top-2 right-2 z-10 flex gap-2">
                  <SocialShareButton product={product} variant="icon" size="sm" />
                  <button
                    onClick={() => handleRemoveFromWishlist(product._id)}
                    className="bg-white rounded-full p-2 shadow-md hover:bg-red-50 transition-colors"
                    title="Remove from wishlist"
                  >
                    <svg
                      className="h-5 w-5 text-red-500"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
                    </svg>
                  </button>
                </div>

                <Link to={`/products/${product._id}`}>
                  {product.previewImage ? (
                    <img
                      src={resolveImageUrl(product.previewImage)}
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
                  <p className="text-xs text-gray-500 mb-1">
                    by {product.seller?.name || 'Unknown'}
                  </p>
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
        )}
      </div>
    </div>
  );
};

export default Wishlist;
