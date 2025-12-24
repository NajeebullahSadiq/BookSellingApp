import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { sellerAPI } from '../../utils/api';
import StatCard from '../../components/common/StatCard';
import LineChart from '../../components/common/LineChart';
import BarChart from '../../components/common/BarChart';

const SellerAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [revenueTrends, setRevenueTrends] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('30days');
  const [topProductsSort, setTopProductsSort] = useState('revenue');

  useEffect(() => {
    console.log('SellerAnalytics component mounted');
    fetchAnalytics();
  }, [period, topProductsSort]);

  const fetchAnalytics = async () => {
    console.log('Fetching analytics...');
    setLoading(true);
    setError(null);
    try {
      const [statsRes, trendsRes, topRes, salesRes] = await Promise.all([
        sellerAPI.getStats(),
        sellerAPI.getRevenueTrends({ period }),
        sellerAPI.getTopProducts({ sortBy: topProductsSort, limit: 5 }),
        sellerAPI.getRecentSales({ limit: 10 })
      ]);

      console.log('Analytics data received:', { statsRes, trendsRes, topRes, salesRes });

      setStats(statsRes.data.data);
      setRevenueTrends(trendsRes.data.data);
      setTopProducts(topRes.data.data);
      setRecentSales(salesRes.data.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch analytics data';
      toast.error(errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="card text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2">Error Loading Analytics</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={fetchAnalytics} className="btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
        <p className="text-gray-600">Track your sales performance and product insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Revenue"
          value={`$${stats?.totalRevenue?.toFixed(2) || '0.00'}`}
          icon="💰"
          color="green"
          subtitle="All time earnings"
        />
        <StatCard
          title="Total Sales"
          value={stats?.totalSales || 0}
          icon="📊"
          color="blue"
          subtitle="Products sold"
        />
        <StatCard
          title="Total Products"
          value={stats?.totalProducts || 0}
          icon="📦"
          color="purple"
          subtitle={`${stats?.approvedProducts || 0} approved`}
        />
        <StatCard
          title="Avg Rating"
          value={stats?.avgRating || '0.0'}
          icon="⭐"
          color="yellow"
          subtitle={`${stats?.totalDownloads || 0} downloads`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Revenue Trends</h2>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="input-field py-1 px-2 text-sm"
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="12months">Last 12 Months</option>
            </select>
          </div>
          <LineChart
            data={revenueTrends}
            xKey="date"
            yKey="revenue"
            color="#10b981"
          />
        </div>

        <div className="card">
          <h2 className="text-xl font-bold mb-4">Sales Count Trends</h2>
          <BarChart
            data={revenueTrends}
            xKey="date"
            yKey="sales"
            color="#3b82f6"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Top Products</h2>
            <select
              value={topProductsSort}
              onChange={(e) => setTopProductsSort(e.target.value)}
              className="input-field py-1 px-2 text-sm"
            >
              <option value="revenue">By Revenue</option>
              <option value="sales">By Sales</option>
            </select>
          </div>
          {topProducts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No sales data yet</p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((product, index) => (
                <div key={`${product.productId}-${index}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  {product.previewImage && (
                    <img
                      src={`${import.meta.env.VITE_API_URL}${product.previewImage}`}
                      alt={product.title}
                      className="w-12 h-12 object-cover rounded"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{product.title}</h3>
                    <p className="text-sm text-gray-600">
                      {product.sales} sales • ${product.revenue.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-yellow-500">⭐ {product.rating?.toFixed(1) || 'N/A'}</div>
                    <div className="text-xs text-gray-500">{product.views} views</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="text-xl font-bold mb-4">Recent Sales</h2>
          {recentSales.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No sales yet</p>
          ) : (
            <div className="space-y-3">
              {recentSales.map((sale, index) => (
                <div key={`${sale.orderId}-${index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{sale.product}</h3>
                    <p className="text-sm text-gray-600">
                      {sale.customer?.name || 'Customer'} • {new Date(sale.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">${sale.price.toFixed(2)}</div>
                    <div className="text-xs text-gray-500">#{sale.orderNumber}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center">
          <div className="text-4xl mb-2">👁️</div>
          <p className="text-2xl font-bold">{stats?.totalViews || 0}</p>
          <p className="text-sm text-gray-600">Total Views</p>
        </div>
        <div className="card text-center">
          <div className="text-4xl mb-2">⬇️</div>
          <p className="text-2xl font-bold">{stats?.totalDownloads || 0}</p>
          <p className="text-sm text-gray-600">Total Downloads</p>
        </div>
        <div className="card text-center">
          <div className="text-4xl mb-2">⏳</div>
          <p className="text-2xl font-bold">{stats?.pendingProducts || 0}</p>
          <p className="text-sm text-gray-600">Pending Approval</p>
        </div>
      </div>
    </div>
  );
};

export default SellerAnalytics;
