import { useState } from 'react';
import { useSelector } from 'react-redux';

const ConversationList = ({ conversations, selectedConversation, onSelectConversation, onDeleteConversation, totalUnread }) => {
  const { user } = useSelector((state) => state.auth);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const getOtherParticipant = (conversation) => {
    return conversation.participants.find(p => p._id !== user?._id);
  };

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return new Date(date).toLocaleDateString();
  };

  const getUnreadCount = (conversation) => {
    if (!conversation.unreadCount || !user) return 0;
    const unreadMap = conversation.unreadCount;
    if (typeof unreadMap.get === 'function') {
      return unreadMap.get(user._id) || 0;
    }
    return unreadMap[user._id] || 0;
  };

  const handleDelete = (e, conversationId) => {
    e.stopPropagation();
    setShowDeleteConfirm(conversationId);
  };

  const confirmDelete = (e, conversationId) => {
    e.stopPropagation();
    onDeleteConversation(conversationId);
    setShowDeleteConfirm(null);
  };

  const cancelDelete = (e) => {
    e.stopPropagation();
    setShowDeleteConfirm(null);
  };

  return (
    <div className="card h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="font-semibold text-lg">Conversations</h2>
        {totalUnread > 0 && (
          <p className="text-sm text-gray-600 mt-1">
            {totalUnread} unread message{totalUnread !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <span className="text-4xl mb-2 block">💬</span>
            <p>No conversations yet</p>
          </div>
        ) : (
          <div className="divide-y">
            {conversations.map((conversation) => {
              const otherParticipant = getOtherParticipant(conversation);
              const unreadCount = getUnreadCount(conversation);
              const isSelected = selectedConversation?._id === conversation._id;

              return (
                <div
                  key={conversation._id}
                  onClick={() => onSelectConversation(conversation)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    isSelected ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                  } ${unreadCount > 0 ? 'bg-blue-50/30' : ''}`}
                >
                  <div className="flex gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                      {otherParticipant?.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                          <h3 className="font-semibold text-gray-900 truncate">
                            {otherParticipant?.name || 'Unknown User'}
                          </h3>
                          {otherParticipant?.role === 'seller' && (
                            <p className="text-xs text-gray-500">
                              {otherParticipant?.sellerProfile?.storeName || 'Seller'}
                            </p>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <span className="bg-blue-600 text-white text-xs font-bold rounded-full px-2 py-1">
                            {unreadCount}
                          </span>
                        )}
                      </div>

                      {conversation.product && (
                        <p className="text-xs text-gray-500 mb-1 truncate">
                          📖 {conversation.product.title}
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        {conversation.lastMessage && (
                          <p className="text-sm text-gray-600 truncate flex-1">
                            {conversation.lastMessage.content}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 ml-2 flex-shrink-0">
                          {formatTimeAgo(conversation.lastMessageAt)}
                        </p>
                      </div>

                      {showDeleteConfirm === conversation._id ? (
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={(e) => confirmDelete(e, conversation._id)}
                            className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                          >
                            Confirm Delete
                          </button>
                          <button
                            onClick={cancelDelete}
                            className="text-xs bg-gray-300 text-gray-700 px-2 py-1 rounded hover:bg-gray-400"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => handleDelete(e, conversation._id)}
                          className="text-xs text-red-600 hover:text-red-800 mt-1"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationList;
