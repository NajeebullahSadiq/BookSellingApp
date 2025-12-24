import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { adminAPI } from '../../utils/api';
import ConfirmModal from '../../components/common/ConfirmModal';
import VerificationBadge from '../../components/common/VerificationBadge';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, userId: null, userName: '' });
  const [verificationModal, setVerificationModal] = useState({ isOpen: false, userId: null, userName: '' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await adminAPI.getUsers();
      setUsers(data.data);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveSellerToggle = async (userId, currentStatus) => {
    try {
      await adminAPI.updateUser(userId, { sellerApproved: !currentStatus });
      toast.success(currentStatus ? 'Seller unapproved' : 'Seller approved');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update seller status');
    }
  };

  const handleVerificationToggle = async (userId, currentStatus, level = 'basic') => {
    try {
      await adminAPI.updateUser(userId, { 
        sellerVerified: !currentStatus,
        verificationLevel: !currentStatus ? level : 'none'
      });
      toast.success(currentStatus ? 'Seller verification removed' : 'Seller verified');
      fetchUsers();
      setVerificationModal({ isOpen: false, userId: null, userName: '' });
    } catch (error) {
      toast.error('Failed to update verification status');
    }
  };

  const openVerificationModal = (userId, userName) => {
    setVerificationModal({ isOpen: true, userId, userName });
  };

  const handleDeleteUser = async () => {
    try {
      await adminAPI.deleteUser(deleteModal.userId);
      toast.success('User deleted');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const openDeleteModal = (userId, userName) => {
    setDeleteModal({ isOpen: true, userId, userName });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, userId: null, userName: '' });
  };

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-12 text-center">Loading users...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Manage Users</h1>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Seller Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Verification</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user._id}>
                  <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        user.role === 'admin'
                          ? 'bg-red-100 text-red-800'
                          : user.role === 'seller'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {user.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.role === 'seller' ? (
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          user.sellerProfile?.isApproved
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {user.sellerProfile?.isApproved ? 'APPROVED' : 'PENDING'}
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.role === 'seller' ? (
                      user.sellerProfile?.isVerified ? (
                        <div className="flex items-center gap-2">
                          <VerificationBadge seller={user} size="sm" showLabel />
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">Not Verified</span>
                      )
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    {user.role === 'seller' && (
                      <>
                        <button
                          onClick={() => handleApproveSellerToggle(user._id, user.sellerProfile?.isApproved)}
                          className={`px-3 py-1 rounded ${
                            user.sellerProfile?.isApproved
                              ? 'bg-yellow-500 hover:bg-yellow-600'
                              : 'bg-green-500 hover:bg-green-600'
                          } text-white`}
                        >
                          {user.sellerProfile?.isApproved ? 'Unapprove' : 'Approve'}
                        </button>
                        <button
                          onClick={() => user.sellerProfile?.isVerified 
                            ? handleVerificationToggle(user._id, true)
                            : openVerificationModal(user._id, user.name)
                          }
                          className={`px-3 py-1 rounded ${
                            user.sellerProfile?.isVerified
                              ? 'bg-gray-500 hover:bg-gray-600'
                              : 'bg-blue-500 hover:bg-blue-600'
                          } text-white`}
                        >
                          {user.sellerProfile?.isVerified ? 'Remove Badge' : 'Verify'}
                        </button>
                      </>
                    )}
                    {user.role !== 'admin' && (
                      <button
                        onClick={() => openDeleteModal(user._id, user.name)}
                        className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteUser}
        title="Delete User"
        message={`Are you sure you want to delete ${deleteModal.userName}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />

      {verificationModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={() => setVerificationModal({ isOpen: false, userId: null, userName: '' })}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Verify Seller: {verificationModal.userName}</h3>
              <p className="text-sm text-gray-600 mb-4">Select a verification level for this seller:</p>
              
              <div className="space-y-3 mb-6">
                <button
                  onClick={() => handleVerificationToggle(verificationModal.userId, false, 'basic')}
                  className="w-full p-4 border-2 border-blue-200 rounded-lg hover:border-blue-500 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">✓</div>
                    <div>
                      <div className="font-semibold">Basic Verified</div>
                      <div className="text-xs text-gray-500">Standard seller verification</div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleVerificationToggle(verificationModal.userId, false, 'trusted')}
                  className="w-full p-4 border-2 border-green-200 rounded-lg hover:border-green-500 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">✓✓</div>
                    <div>
                      <div className="font-semibold">Trusted Seller</div>
                      <div className="text-xs text-gray-500">For sellers with excellent track record</div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleVerificationToggle(verificationModal.userId, false, 'premium')}
                  className="w-full p-4 border-2 border-yellow-200 rounded-lg hover:border-yellow-500 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white rounded-full flex items-center justify-center text-sm font-bold">★</div>
                    <div>
                      <div className="font-semibold">Premium Seller</div>
                      <div className="text-xs text-gray-500">Top-tier seller with outstanding reputation</div>
                    </div>
                  </div>
                </button>
              </div>

              <button
                onClick={() => setVerificationModal({ isOpen: false, userId: null, userName: '' })}
                className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
