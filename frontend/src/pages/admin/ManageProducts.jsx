import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { adminAPI } from '../../utils/api';
import InputModal from '../../components/common/InputModal';

const ManageProducts = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(searchParams.get('status') || '');
  const [rejectionModal, setRejectionModal] = useState({ isOpen: false, productId: null });

  useEffect(() => {
    fetchProducts();
  }, [filter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = filter ? { status: filter } : {};
      const { data } = await adminAPI.getProducts(params);
      setProducts(data.data);
    } catch (error) {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (productId) => {
    try {
      await adminAPI.reviewProduct(productId, { status: 'approved' });
      toast.success('Product approved');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to approve product');
    }
  };

  const handleReject = async (reason) => {
    try {
      await adminAPI.reviewProduct(rejectionModal.productId, {
        status: 'rejected',
        rejectionReason: reason
      });
      toast.success('Product rejected');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to reject product');
    }
  };

  const openRejectionModal = (productId) => {
    setRejectionModal({ isOpen: true, productId });
  };

  const closeRejectionModal = () => {
    setRejectionModal({ isOpen: false, productId: null });
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    if (newFilter) {
      setSearchParams({ status: newFilter });
    } else {
      setSearchParams({});
    }
  };

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-12 text-center">Loading products...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Manage Products</h1>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => handleFilterChange('')}
            className={`px-4 py-2 rounded ${!filter ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            All
          </button>
          <button
            onClick={() => handleFilterChange('pending')}
            className={`px-4 py-2 rounded ${filter === 'pending' ? 'bg-yellow-600 text-white' : 'bg-gray-200'}`}
          >
            Pending
          </button>
          <button
            onClick={() => handleFilterChange('approved')}
            className={`px-4 py-2 rounded ${filter === 'approved' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
          >
            Approved
          </button>
          <button
            onClick={() => handleFilterChange('rejected')}
            className={`px-4 py-2 rounded ${filter === 'rejected' ? 'bg-red-600 text-white' : 'bg-gray-200'}`}
          >
            Rejected
          </button>
        </div>
      </div>

      {/* Products List */}
      {products.length === 0 ? (
        <div className="card text-center py-12 text-gray-500">No products found</div>
      ) : (
        <div className="space-y-4">
          {products.map((product) => (
            <div key={product._id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex flex-1">
                  {product.previewImage ? (
                    <img
                      src={`${import.meta.env.VITE_API_URL}${product.previewImage}`}
                      alt={product.title}
                      className="w-24 h-24 object-cover rounded mr-4"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gray-200 rounded mr-4 flex items-center justify-center text-2xl">
                      📄
                    </div>
                  )}

                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{product.title}</h3>
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
                    <p className="text-sm text-gray-600">Seller: {product.seller?.name} ({product.seller?.email})</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                      <span>${product.price}</span>
                      <span>⭐ {product.rating.toFixed(1)}</span>
                      <span>Downloads: {product.downloads}</span>
                    </div>

                    <div className="mt-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          product.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : product.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {product.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col space-y-2 ml-4">
                  <Link
                    to={`/products/${product._id}`}
                    className="btn-secondary text-sm text-center"
                    target="_blank"
                  >
                    View
                  </Link>
                  {product.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(product._id)}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => openRejectionModal(product._id)}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <InputModal
        isOpen={rejectionModal.isOpen}
        onClose={closeRejectionModal}
        onConfirm={handleReject}
        title="Reject Product"
        message="Please provide a reason for rejecting this product:"
        placeholder="Enter rejection reason..."
        confirmText="Reject"
        cancelText="Cancel"
        type="danger"
        required={true}
      />
    </div>
  );
};

export default ManageProducts;
