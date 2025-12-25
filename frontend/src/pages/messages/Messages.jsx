import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { messageAPI } from '../../utils/api';
import { toast } from 'react-toastify';
import ConversationList from './components/ConversationList';
import ConversationView from './components/ConversationView';
import { connectSocket, disconnectSocket } from '../../utils/socket';

const Messages = () => {
  const { conversationId } = useParams();
  const { token, user } = useSelector((state) => state.auth);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totalUnread, setTotalUnread] = useState(0);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (!token) return;

    const s = connectSocket(token);
    setSocket(s);

    const getUnreadForUser = (conversation) => {
      if (!conversation?.unreadCount || !user?._id) return 0;
      if (typeof conversation.unreadCount.get === 'function') {
        return conversation.unreadCount.get(user._id) || 0;
      }
      return conversation.unreadCount[user._id] || 0;
    };

    const recomputeTotalUnread = (nextConversations) => {
      const total = nextConversations.reduce((sum, conv) => sum + getUnreadForUser(conv), 0);
      setTotalUnread(total);
    };

    const handleConversationUpsert = (updatedConversation) => {
      setConversations((prev) => {
        const existingIndex = prev.findIndex((c) => c._id === updatedConversation._id);
        let next;

        if (existingIndex === -1) {
          next = [updatedConversation, ...prev];
        } else {
          next = prev.map((c) => (c._id === updatedConversation._id ? updatedConversation : c));
        }

        next.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
        recomputeTotalUnread(next);
        return next;
      });

      setSelectedConversation((prev) =>
        prev?._id === updatedConversation._id ? updatedConversation : prev
      );
    };

    s.on('conversation:upsert', handleConversationUpsert);

    return () => {
      s.off('conversation:upsert', handleConversationUpsert);
      disconnectSocket();
      setSocket(null);
    };
  }, [token, user?._id]);

  useEffect(() => {
    if (conversationId) {
      loadConversation(conversationId);
    }
  }, [conversationId]);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const { data } = await messageAPI.getConversations();
      setConversations(data.data);
      setTotalUnread(data.totalUnread || 0);
    } catch (error) {
      toast.error('Failed to fetch conversations');
    } finally {
      setLoading(false);
    }
  };

  const loadConversation = async (id) => {
    try {
      const { data } = await messageAPI.getConversation(id);
      setSelectedConversation(data.data);
    } catch (error) {
      toast.error('Failed to load conversation');
    }
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
  };

  const handleMessageSent = (updatedConversation) => {
    if (!updatedConversation?._id) return;
    setConversations((prev) =>
      prev.map((c) => (c._id === updatedConversation._id ? updatedConversation : c))
    );
  };

  const handleDeleteConversation = async (id) => {
    try {
      await messageAPI.deleteConversation(id);
      setConversations(conversations.filter(c => c._id !== id));
      if (selectedConversation?._id === id) {
        setSelectedConversation(null);
      }
      toast.success('Conversation deleted');
    } catch (error) {
      toast.error('Failed to delete conversation');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Messages</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-250px)]">
        <div className="md:col-span-1">
          <ConversationList
            conversations={conversations}
            selectedConversation={selectedConversation}
            onSelectConversation={handleSelectConversation}
            onDeleteConversation={handleDeleteConversation}
            totalUnread={totalUnread}
          />
        </div>
        
        <div className="md:col-span-2">
          {selectedConversation ? (
            <ConversationView
              conversation={selectedConversation}
              onMessageSent={handleMessageSent}
              socket={socket}
            />
          ) : (
            <div className="card h-full flex items-center justify-center">
              <div className="text-center text-gray-500">
                <span className="text-6xl mb-4 block">💬</span>
                <p className="text-xl">Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
