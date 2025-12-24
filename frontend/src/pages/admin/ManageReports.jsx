import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { reportAPI } from '../../utils/api';

const ManageReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    reportType: ''
  });
  const [selectedReport, setSelectedReport] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0
  });

  useEffect(() => {
    fetchReports();
  }, [filters, pagination.currentPage]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.currentPage,
        limit: 20,
        ...(filters.status && { status: filters.status }),
        ...(filters.reportType && { reportType: filters.reportType })
      };
      const { data } = await reportAPI.getAll(params);
      setReports(data.data);
      setPagination({
        currentPage: data.currentPage,
        totalPages: data.totalPages,
        total: data.total
      });
    } catch (error) {
      toast.error('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (reportId, newStatus) => {
    try {
      await reportAPI.updateStatus(reportId, { status: newStatus });
      toast.success(`Report marked as ${newStatus}`);
      fetchReports();
      if (selectedReport?._id === reportId) {
        setSelectedReport(null);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update report status');
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedReport) return;
    try {
      await reportAPI.updateStatus(selectedReport._id, { adminNotes });
      toast.success('Admin notes saved');
      fetchReports();
      setSelectedReport(null);
      setAdminNotes('');
    } catch (error) {
      toast.error('Failed to save notes');
    }
  };

  const openReportDetails = (report) => {
    setSelectedReport(report);
    setAdminNotes(report.adminNotes || '');
  };

  const closeReportDetails = () => {
    setSelectedReport(null);
    setAdminNotes('');
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      pending: 'bg-yellow-100 text-yellow-800',
      reviewed: 'bg-blue-100 text-blue-800',
      resolved: 'bg-green-100 text-green-800',
      dismissed: 'bg-gray-100 text-gray-800'
    };
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${statusStyles[status]}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const getReasonLabel = (reason) => {
    const labels = {
      inappropriate_content: 'Inappropriate Content',
      spam: 'Spam',
      misleading: 'Misleading',
      copyright_violation: 'Copyright Violation',
      offensive_language: 'Offensive Language',
      scam: 'Scam',
      fake_review: 'Fake Review',
      other: 'Other'
    };
    return labels[reason] || reason;
  };

  if (loading && reports.length === 0) {
    return <div className="max-w-7xl mx-auto px-4 py-12 text-center">Loading reports...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Manage Reports</h1>

      {/* Filters */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="input-field"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="resolved">Resolved</option>
              <option value="dismissed">Dismissed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
            <select
              value={filters.reportType}
              onChange={(e) => setFilters({ ...filters, reportType: e.target.value })}
              className="input-field"
            >
              <option value="">All Types</option>
              <option value="product">Product</option>
              <option value="review">Review</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ status: '', reportType: '' })}
              className="btn-secondary w-full"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card">
          <h3 className="text-gray-600 text-sm mb-1">Total Reports</h3>
          <p className="text-2xl font-bold text-blue-600">{pagination.total}</p>
        </div>
        <div className="card">
          <h3 className="text-gray-600 text-sm mb-1">Pending</h3>
          <p className="text-2xl font-bold text-yellow-600">
            {reports.filter(r => r.status === 'pending').length}
          </p>
        </div>
        <div className="card">
          <h3 className="text-gray-600 text-sm mb-1">Resolved</h3>
          <p className="text-2xl font-bold text-green-600">
            {reports.filter(r => r.status === 'resolved').length}
          </p>
        </div>
        <div className="card">
          <h3 className="text-gray-600 text-sm mb-1">Dismissed</h3>
          <p className="text-2xl font-bold text-gray-600">
            {reports.filter(r => r.status === 'dismissed').length}
          </p>
        </div>
      </div>

      {/* Reports Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reported By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reports.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No reports found
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        report.reportType === 'product' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {report.reportType.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {getReasonLabel(report.reason)}
                      </div>
                      {report.description && (
                        <div className="text-xs text-gray-500 truncate max-w-xs">
                          {report.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {report.reportedBy?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(report.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <button
                        onClick={() => openReportDetails(report)}
                        className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded"
                      >
                        View
                      </button>
                      {report.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(report._id, 'reviewed')}
                            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded"
                          >
                            Mark Reviewed
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(report._id, 'resolved')}
                            className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded"
                          >
                            Resolve
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(report._id, 'dismissed')}
                            className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded"
                          >
                            Dismiss
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-6 pb-4">
            <button
              onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage - 1 })}
              disabled={pagination.currentPage === 1}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage + 1 })}
              disabled={pagination.currentPage === pagination.totalPages}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Report Details Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={closeReportDetails}>
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Report Details</h3>
                <button onClick={closeReportDetails} className="text-gray-500 hover:text-gray-700 text-2xl">
                  &times;
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Report Type</label>
                  <p className="text-gray-900">{selectedReport.reportType.toUpperCase()}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Reason</label>
                  <p className="text-gray-900">{getReasonLabel(selectedReport.reason)}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <p className="text-gray-900">{selectedReport.description || 'No description provided'}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Reported By</label>
                  <p className="text-gray-900">
                    {selectedReport.reportedBy?.name} ({selectedReport.reportedBy?.email})
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedReport.status)}</div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Reported Item Details</label>
                  <div className="mt-1 p-3 bg-gray-50 rounded">
                    {selectedReport.reportType === 'product' && selectedReport.reportedItem ? (
                      <div>
                        <p className="font-medium">{selectedReport.reportedItem.title}</p>
                        <p className="text-sm text-gray-600">{selectedReport.reportedItem.description}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          Seller: {selectedReport.reportedItem.seller?.name}
                        </p>
                      </div>
                    ) : selectedReport.reportType === 'review' && selectedReport.reportedItem ? (
                      <div>
                        <p className="text-sm">Rating: {'⭐'.repeat(selectedReport.reportedItem.rating)}</p>
                        <p className="text-sm text-gray-600">{selectedReport.reportedItem.comment}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          By: {selectedReport.reportedItem.user?.name}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Item details not available</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Admin Notes</label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="input-field mt-1"
                    rows="4"
                    maxLength="500"
                    placeholder="Add notes about this report..."
                  />
                  <p className="text-xs text-gray-500 mt-1">{adminNotes.length}/500 characters</p>
                </div>

                {selectedReport.resolvedBy && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Resolved By</label>
                    <p className="text-gray-900">
                      {selectedReport.resolvedBy?.name} on {new Date(selectedReport.resolvedAt).toLocaleDateString()}
                    </p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-700">Reported On</label>
                  <p className="text-gray-900">{new Date(selectedReport.createdAt).toLocaleString()}</p>
                </div>
              </div>

              <div className="flex space-x-3 justify-end mt-6 pt-4 border-t">
                <button
                  onClick={handleSaveNotes}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save Notes
                </button>
                {selectedReport.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleStatusUpdate(selectedReport._id, 'resolved')}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Mark Resolved
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(selectedReport._id, 'dismissed')}
                      className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                    >
                      Dismiss
                    </button>
                  </>
                )}
                <button
                  onClick={closeReportDetails}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageReports;
