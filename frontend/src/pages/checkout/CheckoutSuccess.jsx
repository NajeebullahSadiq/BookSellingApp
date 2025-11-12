import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { clearCart } from '../../store/slices/cartSlice';

const CheckoutSuccess = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Clear cart after successful purchase
    dispatch(clearCart());
  }, [dispatch]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 text-center">
      <div className="card">
        <div className="text-6xl mb-6">✅</div>
        <h1 className="text-3xl font-bold text-green-600 mb-4">Payment Successful!</h1>
        <p className="text-gray-600 mb-8">
          Thank you for your purchase. Your order has been confirmed and you can now download your products.
        </p>
        
        <div className="space-x-4">
          <Link to="/orders" className="btn-primary">
            View My Orders
          </Link>
          <Link to="/products" className="btn-secondary">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
