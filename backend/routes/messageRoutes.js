const express = require('express');
const router = express.Router();
const {
  getMyConversations,
  getConversation,
  getMessages,
  sendMessage,
  markMessagesAsRead,
  deleteConversation,
  getUnreadMessagesCount
} = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/conversations', getMyConversations);
router.get('/conversations/:id', getConversation);
router.get('/conversations/:conversationId/messages', getMessages);
router.post('/send', sendMessage);
router.put('/conversations/:conversationId/mark-read', markMessagesAsRead);
router.delete('/conversations/:id', deleteConversation);
router.get('/unread-count', getUnreadMessagesCount);

module.exports = router;
