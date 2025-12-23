import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { setCurrentProduct } from '../../store/slices/productSlice';
import { addToCart } from '../../store/slices/cartSlice';
import { productAPI, reviewAPI } from '../../utils/api';
import WishlistButton from '../../components/common/WishlistButton';
import ProductPreview from '../../components/common/ProductPreview';

const ProductDetail = () => {
  const { id } = useParams();
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [loading, setLoading] = useState(true);

  const dispatch = useDispatch();
  const { currentProduct } = useSelector((state) => state.products);
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchProduct();
    fetchReviews();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const { data } = await productAPI.getById(id);
      dispatch(setCurrentProduct(data.data));
    } catch (error) {
      toast.error('Failed to fetch product');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const { data } = await reviewAPI.getProductReviews(id);
      setReviews(data.data);
    } catch (error) {
      console.error('Failed to fetch reviews');
    }
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }
    dispatch(addToCart(currentProduct));
    toast.success('Added to cart!');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      await reviewAPI.create({ product: id, ...reviewForm });
      toast.success('Review submitted!');
      fetchReviews();
      setReviewForm({ rating: 5, comment: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    }
  };

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-12 text-center">Loading...</div>;
  }

  if (!currentProduct) {
    return <div className="max-w-7xl mx-auto px-4 py-12 text-center">Product not found</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Product Image */}
        <div>
          {currentProduct.previewImage ? (
            <img
              src={`${import.meta.env.VITE_API_URL}${currentProduct.previewImage}`}
              alt={currentProduct.title}
              className="w-full rounded-lg shadow-lg"
            />
          ) : (
            <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center text-6xl">
              📄
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-bold mb-4">{currentProduct.title}</h1>

          <div className="flex items-center mb-4">
            <span className="text-yellow-500 text-xl mr-2">⭐ {currentProduct.rating.toFixed(1)}</span>
            <span className="text-gray-600">({currentProduct.numReviews} reviews)</span>
          </div>

          <div className="text-4xl font-bold text-blue-600 mb-6">${currentProduct.price}</div>

          <div className="mb-6">
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-gray-700">{currentProduct.description}</p>
          </div>

          <div className="mb-6">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Category:</span> {currentProduct.category?.name}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Seller:</span> {currentProduct.seller?.name}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-semibold">File Type:</span> {currentProduct.fileType}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Downloads:</span> {currentProduct.downloads}
            </p>
          </div>

          {currentProduct.tags && currentProduct.tags.length > 0 && (
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {currentProduct.tags.map((tag, index) => (
                  <span key={index} className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {currentProduct.previewPages && currentProduct.previewPages.length > 0 && (
              <ProductPreview previewPages={currentProduct.previewPages} />
            )}
            <div className="flex gap-3">
              <button onClick={handleAddToCart} className="btn-primary flex-1 text-lg py-3">
                Add to Cart
              </button>
              <WishlistButton productId={currentProduct._id} size="lg" />
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="card">
        <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>

        {isAuthenticated && (
          <form onSubmit={handleReviewSubmit} className="mb-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-4">Write a Review</h3>
            <div className="mb-4">
              <label className="block mb-2">Rating</label>
              <select
                value={reviewForm.rating}
                onChange={(e) => setReviewForm({ ...reviewForm, rating: e.target.value })}
                className="input-field"
              >
                <option value="5">5 - Excellent</option>
                <option value="4">4 - Good</option>
                <option value="3">3 - Average</option>
                <option value="2">2 - Poor</option>
                <option value="1">1 - Terrible</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block mb-2">Comment</label>
              <textarea
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                className="input-field"
                rows="4"
                placeholder="Share your experience..."
              />
            </div>
            <button type="submit" className="btn-primary">Submit Review</button>
          </form>
        )}

        {reviews.length === 0 ? (
          <p className="text-gray-500">No reviews yet. Be the first to review!</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review._id} className="border-b pb-4">
                <div className="flex items-center mb-2">
                  <span className="font-semibold mr-2">{review.user?.name}</span>
                  <span className="text-yellow-500">{'⭐'.repeat(review.rating)}</span>
                  {review.isVerifiedPurchase && (
                    <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      Verified Purchase
                    </span>
                  )}
                </div>
                <p className="text-gray-700">{review.comment}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
