import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { updateUser } from '../../store/slices/authSlice';
import { authAPI } from '../../utils/api';
import VerificationBadge from '../../components/common/VerificationBadge';

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
  });

  const [sellerData, setSellerData] = useState({
    storeName: user?.sellerProfile?.storeName || '',
    bio: user?.sellerProfile?.bio || '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSellerChange = (e) => {
    setSellerData({ ...sellerData, [e.target.name]: e.target.value });
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const { data } = await authAPI.updateProfile(formData);
      dispatch(updateUser(data.data));
      toast.success('Profile updated successfully');
      setFormData({ ...formData, currentPassword: '', newPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    }
  };

  const handleSellerUpdate = async (e) => {
    e.preventDefault();
    try {
      const { data } = await authAPI.updateSellerProfile(sellerData);
      dispatch(updateUser(data.data));
      toast.success('Seller profile updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>

      {/* Basic Profile */}
      <div className="card mb-8">
        <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Change Password</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Leave blank to keep unchanged"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Leave blank to keep unchanged"
                />
              </div>
            </div>
          </div>

          <button type="submit" className="btn-primary">
            Update Profile
          </button>
        </form>
      </div>

      {/* Seller Profile (if user is a seller) */}
      {user?.role === 'seller' && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Seller Information</h2>
            {user.sellerProfile?.isVerified && (
              <VerificationBadge seller={user} size="md" showLabel />
            )}
          </div>
          
          {!user.sellerProfile?.isApproved && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4">
              <p className="text-yellow-700">
                ⚠️ Your seller account is pending admin approval. You won't be able to create products until approved.
              </p>
            </div>
          )}

          {user.sellerProfile?.isVerified && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
              <p className="text-blue-700 flex items-center gap-2">
                <span className="text-lg">✓</span>
                <span>
                  You are a <strong>{user.sellerProfile.verificationLevel}</strong> verified seller! 
                  This badge helps build trust with customers.
                </span>
              </p>
            </div>
          )}

          <form onSubmit={handleSellerUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Store Name</label>
              <input
                type="text"
                name="storeName"
                value={sellerData.storeName}
                onChange={handleSellerChange}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Bio</label>
              <textarea
                name="bio"
                value={sellerData.bio}
                onChange={handleSellerChange}
                className="input-field"
                rows="4"
                placeholder="Tell customers about your store..."
              />
            </div>

            <div className="text-sm text-gray-600">
              <p>Total Sales: {user.sellerProfile?.totalSales || 0}</p>
              <p>Earnings: ${user.sellerProfile?.earnings || 0}</p>
            </div>

            <button type="submit" className="btn-primary">
              Update Seller Profile
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Profile;
