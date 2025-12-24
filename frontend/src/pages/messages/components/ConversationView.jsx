import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { messageAPI } from '../../../utils/api';
import { toast } from 'react-toastify';
import MessageInput from './MessageInput';

const ConversationView = ({ conversation, onMessageSent }) => {
  const { user } = useSelector((state) => state.auth);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    if (conversation) {
      fetchMessages();
      markAsRead();
    }
  }, [conversation._id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const { data } = await messageAPI.getMessages(conversation._id);
      setMessages(data.data);
    } catch (error) {
      toast.error('Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async () => {
    try {
      await messageAPI.markAsRead(conversation._id);
    } catch (error) {
      console.error('Failed to mark as read');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (content) => {
    try {
      const { data } = await messageAPI.sendMessage({
        conversationId: conversation._id,
        content
      });
      setMessages([...messages, data.data.message]);
      onMessageSent();
    } catch (error) {
      toast.error('Failed to send message');
      throw error;
    }
  };

  const getOtherParticipant = () => {
    return conversation.participants.find(p => p._id !== user?._id);
  };

  const formatMessageTime = (date) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return messageDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday ' + messageDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else {
      return messageDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' + 
             messageDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
  };

  const otherParticipant = getOtherParticipant();

  if (loading) {
    return (
      <div className="card h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="card h-full flex flex-col">
      <div className="p-4 border-b flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
          {otherParticipant?.name?.charAt(0).toUpperCase() || '?'}
        </div>
        <div>
          <h2 className="font-semibold text-lg">{otherParticipant?.name || 'Unknown User'}</h2>
          {otherParticipant?.role === 'seller' && (
            <p className="text-sm text-gray-500">
              {otherParticipant?.sellerProfile?.storeName || 'Seller'}
            </p>
          )}
        </div>
      </div>

      {conversation.product && (
        <div className="p-3 bg-blue-50 border-b flex items-center gap-3">
          {conversation.product.previewImage ? (
            <img
              src={`${import.meta.env.VITE_API_URL}${conversation.product.previewImage}`}
              alt={conversation.product.title}
              className="w-12 h-12 object-cover rounded"
            />
          ) : (
            <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-2xl">
              📄
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {conversation.product.title}
            </p>
            <p className="text-sm text-gray-600">
              ${conversation.product.price}
            </p>
          </div>
        </div>
      )}

      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isMine = message.sender._id === user?._id;
            
            return (
              <div
                key={message._id}
                className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[70%] ${isMine ? 'order-2' : 'order-1'}`}>
                  {!isMine && (
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-semibold">
                        {message.sender.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <span className="text-xs text-gray-600">{message.sender.name}</span>
                    </div>
                  )}
                  <div
                    className={`rounded-lg px-4 py-2 ${
                      isMine
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="break-words">{message.content}</p>
                  </div>
                  <p className={`text-xs text-gray-500 mt-1 ${isMine ? 'text-right' : 'text-left'}`}>
                    {formatMessageTime(message.createdAt)}
                    {isMine && message.isRead && ' · Read'}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t">
        <MessageInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
};

export default ConversationView;
