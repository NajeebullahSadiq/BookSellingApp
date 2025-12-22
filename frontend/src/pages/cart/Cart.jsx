import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { removeFromCart, clearCart } from '../../store/slices/cartSlice';
import { orderAPI } from '../../utils/api';
import { loadStripe } from '@stripe/stripe-js';

// Load Stripe with publishable key from environment variable
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_mockkey');

const Cart = () => {
  const { items, total } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleRemove = (id) => {
    dispatch(removeFromCart(id));
    toast.success('Removed from cart');
  };

  const handleCheckout = async () => {
    try {
      const { data } = await orderAPI.createCheckoutSession({
        items: items.map(item => ({ productId: item._id }))
      });

      // Check if this is a mock payment (will have redirectUrl)
      if (data.isMockPayment && data.redirectUrl) {
        console.log('Mock payment detected - redirecting to success page');
        // For mock payments, redirect directly to the success page
        window.location.href = data.redirectUrl;
        return;
      }

      // Regular Stripe checkout flow
      const stripe = await stripePromise;
      const { error } = await stripe.redirectToCheckout({
        sessionId: data.sessionId
      });

      if (error) {
        toast.error(error.message);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(
        error.response?.data?.message || 
        'Checkout failed. Please try again.'
      );
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <Link to="/products" className="btn-primary">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item._id} className="card flex items-center">
              {item.previewImage ? (
                <img
                  src={`${import.meta.env.VITE_API_URL}${item.previewImage}`}
                  alt={item.title}
                  className="w-24 h-24 object-cover rounded mr-4"
                />
              ) : (
                <div className="w-24 h-24 bg-gray-200 rounded mr-4 flex items-center justify-center text-2xl">
                  📄
                </div>
              )}

              <div className="flex-1">
                <Link to={`/products/${item._id}`} className="font-semibold hover:text-blue-600">
                  {item.title}
                </Link>
                <p className="text-gray-600 text-sm mt-1 line-clamp-2">{item.description}</p>
                <p className="text-blue-600 font-bold mt-2">${item.price}</p>
              </div>

              <button
                onClick={() => handleRemove(item._id)}
                className="text-red-500 hover:text-red-700 ml-4"
              >
                ✕ Remove
              </button>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="card sticky top-4">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Items ({items.length})</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Processing Fee</span>
                <span>$0.00</span>
              </div>
            </div>

            <div className="border-t pt-4 mb-4">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-blue-600">${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="btn-primary w-full mb-2"
            >
              Proceed to Checkout
            </button>
            
            <button
              onClick={() => dispatch(clearCart())}
              className="btn-secondary w-full"
            >
              Clear Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
