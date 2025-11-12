import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const SellerDashboard = () => {
  const { user } = useSelector((state) => state.auth);

  if (!user?.sellerProfile?.isApproved) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="card text-center">
          <div className="text-6xl mb-4">⏳</div>
          <h2 className="text-2xl font-bold mb-4">Seller Account Pending Approval</h2>
          <p className="text-gray-600 mb-6">
            Your seller account is currently under review by our admin team.
            You'll be able to create and manage products once approved.
          </p>
          <Link to="/profile" className="btn-primary">
            Update Profile
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Seller Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <h3 className="text-gray-600 mb-2">Total Sales</h3>
          <p className="text-3xl font-bold text-blue-600">{user.sellerProfile?.totalSales || 0}</p>
        </div>
        <div className="card">
          <h3 className="text-gray-600 mb-2">Total Earnings</h3>
          <p className="text-3xl font-bold text-green-600">${user.sellerProfile?.earnings || 0}</p>
        </div>
        <div className="card">
          <h3 className="text-gray-600 mb-2">Store Rating</h3>
          <p className="text-3xl font-bold text-yellow-600">
            ⭐ {user.sellerProfile?.rating?.toFixed(1) || '0.0'}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link to="/seller/create-product" className="btn-primary text-center">
            ➕ Create New Product
          </Link>
          <Link to="/seller/products" className="btn-secondary text-center">
            📦 Manage My Products
          </Link>
        </div>
      </div>

      {/* Store Info */}
      <div className="card mt-8">
        <h2 className="text-xl font-bold mb-4">Store Information</h2>
        <div className="space-y-2">
          <p><strong>Store Name:</strong> {user.sellerProfile?.storeName || 'Not set'}</p>
          <p><strong>Bio:</strong> {user.sellerProfile?.bio || 'Not set'}</p>
          <Link to="/profile" className="text-blue-600 hover:underline">
            Edit Store Info →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
