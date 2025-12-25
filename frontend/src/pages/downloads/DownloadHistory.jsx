import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { downloadHistoryAPI, productAPI } from '../../utils/api';

const DownloadHistory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchHistory();
  }, [page]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const { data } = await downloadHistoryAPI.getMy({ page, limit: 20 });
      setItems(data.data);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      toast.error('Failed to fetch download history');
    } finally {
      setLoading(false);
    }
  };

  const handleRedownload = async (historyItem) => {
    const productId = historyItem?.product?._id || historyItem?.product;
    const fileName = historyItem?.fileName || historyItem?.product?.fileName || historyItem?.productTitle || 'download';

    if (!productId) {
      toast.error('Unable to download this item');
      return;
    }

    try {
      const response = await productAPI.download(productId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Download started');
    } catch (error) {
      toast.error('Download failed');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Download History</h1>
          <p className="text-gray-600 mt-1">Your recent downloads</p>
        </div>
        <Link to="/orders" className="btn-secondary">
          View Orders
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="card text-center py-12">
          <span className="text-6xl mb-4 block">⬇️</span>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No downloads yet</h3>
          <p className="text-gray-500">When you download a purchased file, it will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const productId = item?.product?._id || item?.product;
            const title = item?.productTitle || item?.product?.title || 'Untitled';
            const downloadedAt = item?.downloadedAt ? new Date(item.downloadedAt).toLocaleString() : '';
            const previewImage = item?.product?.previewImage;

            return (
              <div key={item._id} className="card">
                <div className="flex gap-4">
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt={title}
                      className="w-20 h-20 object-cover rounded-md border"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-md border flex items-center justify-center text-3xl">📄</div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        {productId ? (
                          <Link
                            to={`/products/${productId}`}
                            className="font-semibold text-gray-900 hover:text-blue-600 block truncate"
                          >
                            {title}
                          </Link>
                        ) : (
                          <p className="font-semibold text-gray-900 truncate">{title}</p>
                        )}
                        <p className="text-sm text-gray-600 truncate">{item.fileName}</p>
                        {downloadedAt && (
                          <p className="text-sm text-gray-500 mt-1">Downloaded: {downloadedAt}</p>
                        )}
                      </div>

                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleRedownload(item)}
                          className="btn-primary text-sm"
                        >
                          ⬇️ Download
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-4">
              <button
                className="btn-secondary"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Prev
              </button>
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <button
                className="btn-secondary"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DownloadHistory;
