import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { productAPI } from '../../utils/api';

const MyProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await productAPI.getMyProducts();
      setProducts(data.data);
    } catch (error) {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await productAPI.delete(id);
      toast.success('Product deleted');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-12 text-center">Loading products...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Products</h1>
        <Link to="/seller/create-product" className="btn-primary">
          ➕ Create New Product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">📦</div>
          <p className="text-gray-600 mb-4">You haven't created any products yet</p>
          <Link to="/seller/create-product" className="btn-primary">
            Create Your First Product
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {products.map((product) => (
            <div key={product._id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex flex-1">
                  {product.previewImage ? (
                    <img
                      src={`http://localhost:5000${product.previewImage}`}
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
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>${product.price}</span>
                      <span>⭐ {product.rating.toFixed(1)}</span>
                      <span>Downloads: {product.downloads}</span>
                      <span>Views: {product.views}</span>
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
                      {product.status === 'rejected' && product.rejectionReason && (
                        <p className="text-sm text-red-600 mt-1">
                          Reason: {product.rejectionReason}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col space-y-2 ml-4">
                  <Link
                    to={`/products/${product._id}`}
                    className="btn-secondary text-sm text-center"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => handleDelete(product._id)}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyProducts;
