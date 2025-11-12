import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { adminAPI } from '../../utils/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await adminAPI.getStats();
      setStats(data.data);
    } catch (error) {
      toast.error('Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-12 text-center">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <h3 className="text-gray-600 text-sm mb-1">Total Users</h3>
          <p className="text-3xl font-bold text-blue-600">{stats?.totalUsers || 0}</p>
        </div>
        <div className="card">
          <h3 className="text-gray-600 text-sm mb-1">Total Sellers</h3>
          <p className="text-3xl font-bold text-purple-600">{stats?.totalSellers || 0}</p>
        </div>
        <div className="card">
          <h3 className="text-gray-600 text-sm mb-1">Total Products</h3>
          <p className="text-3xl font-bold text-green-600">{stats?.totalProducts || 0}</p>
        </div>
        <div className="card">
          <h3 className="text-gray-600 text-sm mb-1">Total Revenue</h3>
          <p className="text-3xl font-bold text-yellow-600">${stats?.totalRevenue || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <h3 className="text-gray-600 text-sm mb-1">Approved Products</h3>
          <p className="text-2xl font-bold text-green-600">{stats?.approvedProducts || 0}</p>
        </div>
        <div className="card">
          <h3 className="text-gray-600 text-sm mb-1">Pending Products</h3>
          <p className="text-2xl font-bold text-yellow-600">{stats?.pendingProducts || 0}</p>
        </div>
        <div className="card">
          <h3 className="text-gray-600 text-sm mb-1">Completed Orders</h3>
          <p className="text-2xl font-bold text-blue-600">{stats?.completedOrders || 0}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/admin/users" className="btn-primary text-center">
            👥 Manage Users
          </Link>
          <Link to="/admin/products" className="btn-secondary text-center">
            📦 Manage Products
          </Link>
          <Link to="/admin/products?status=pending" className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-center">
            ⏳ Pending Approvals ({stats?.pendingProducts || 0})
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
