import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { messageAPI } from '../../utils/api';
import { toast } from 'react-toastify';

const MessageButton = ({ sellerId, sellerName, productId, productTitle }) => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [sending, setSending] = useState(false);

  const handleMessageSeller = async () => {
    if (!isAuthenticated) {
      toast.info('Please login to message the seller');
      navigate('/login');
      return;
    }

    if (user._id === sellerId) {
      toast.info('You cannot message yourself');
      return;
    }

    setSending(true);
    try {
      const { data } = await messageAPI.sendMessage({
        recipientId: sellerId,
        productId: productId,
        content: `Hi! I'm interested in "${productTitle}". Can you provide more details?`
      });

      toast.success('Message sent! Redirecting to conversation...');
      navigate(`/messages/${data.data.conversation._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (!sellerId) {
    return null;
  }

  if (isAuthenticated && user?._id === sellerId) {
    return null;
  }

  return (
    <button
      onClick={handleMessageSeller}
      disabled={sending}
      className="w-full btn-secondary flex items-center justify-center gap-2"
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
        />
      </svg>
      {sending ? 'Sending...' : `Message ${sellerName || 'Seller'}`}
    </button>
  );
};

export default MessageButton;
