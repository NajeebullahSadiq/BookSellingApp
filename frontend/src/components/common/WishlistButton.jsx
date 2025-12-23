import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { addToWishlist, removeFromWishlist, setWishlist } from '../../store/slices/wishlistSlice';
import { wishlistAPI } from '../../utils/api';

const WishlistButton = ({ productId, size = 'md', className = '' }) => {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.wishlist);

  useEffect(() => {
    if (isAuthenticated && items) {
      const inWishlist = items.some(item => item._id === productId);
      setIsInWishlist(inWishlist);
    }
  }, [items, productId, isAuthenticated]);

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please login to add to wishlist');
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      if (isInWishlist) {
        await wishlistAPI.removeFromWishlist(productId);
        dispatch(removeFromWishlist(productId));
        toast.success('Removed from wishlist');
      } else {
        const { data } = await wishlistAPI.addToWishlist(productId);
        dispatch(setWishlist(data.data));
        toast.success('Added to wishlist');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'h-8 w-8 p-1.5',
    md: 'h-10 w-10 p-2',
    lg: 'h-12 w-12 p-2.5'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  return (
    <button
      onClick={handleToggleWishlist}
      disabled={loading}
      className={`
        ${sizeClasses[size]}
        rounded-full
        bg-white
        shadow-md
        hover:shadow-lg
        transition-all
        duration-200
        ${isInWishlist ? 'hover:bg-red-50' : 'hover:bg-gray-50'}
        ${loading ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      {loading ? (
        <svg
          className={`${iconSizes[size]} animate-spin text-gray-400`}
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        <svg
          className={`${iconSizes[size]} ${isInWishlist ? 'text-red-500' : 'text-gray-400'}`}
          fill={isInWishlist ? 'currentColor' : 'none'}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      )}
    </button>
  );
};

export default WishlistButton;
