const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const { createNotification } = require('./notificationController');
const { getIO } = require('../utils/socket');

exports.getMyConversations = async (req, res) => {
  try {
    const { limit = 20, page = 1 } = req.query;

    const conversations = await Conversation.find({
      participants: req.user._id
    })
      .populate('participants', 'name email profileImage role sellerProfile.storeName')
      .populate('product', 'title previewImage price')
      .populate('lastMessage')
      .sort({ lastMessageAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Conversation.countDocuments({
      participants: req.user._id
    });

    let totalUnread = 0;
    conversations.forEach(conv => {
      const unreadCount = conv.unreadCount.get(req.user._id.toString()) || 0;
      totalUnread += unreadCount;
    });

    res.status(200).json({
      success: true,
      data: conversations,
      totalUnread,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      total: count
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id)
      .populate('participants', 'name email profileImage role sellerProfile.storeName')
      .populate('product', 'title previewImage price');

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    if (!conversation.participants.some(p => p._id.toString() === req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this conversation'
      });
    }

    res.status(200).json({
      success: true,
      data: conversation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { limit = 50, page = 1 } = req.query;
    const conversationId = req.params.conversationId;

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    if (!conversation.participants.some(p => p.toString() === req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this conversation'
      });
    }

    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'name profileImage')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Message.countDocuments({ conversation: conversationId });

    res.status(200).json({
      success: true,
      data: messages.reverse(),
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      total: count
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { conversationId, recipientId, content, productId } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    let conversation;

    if (conversationId) {
      conversation = await Conversation.findById(conversationId);
      
      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: 'Conversation not found'
        });
      }

      if (!conversation.participants.some(p => p.toString() === req.user._id.toString())) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized'
        });
      }
    } else {
      if (!recipientId) {
        return res.status(400).json({
          success: false,
          message: 'Recipient is required for new conversation'
        });
      }

      const existingConversation = await Conversation.findOne({
        participants: { $all: [req.user._id, recipientId] },
        product: productId || null
      });

      if (existingConversation) {
        conversation = existingConversation;
      } else {
        conversation = await Conversation.create({
          participants: [req.user._id, recipientId],
          product: productId || null,
          unreadCount: {
            [req.user._id.toString()]: 0,
            [recipientId]: 0
          }
        });
      }
    }

    const message = await Message.create({
      conversation: conversation._id,
      sender: req.user._id,
      content: content.trim()
    });

    conversation.lastMessage = message._id;
    conversation.lastMessageAt = new Date();

    const otherParticipant = conversation.participants.find(
      p => p.toString() !== req.user._id.toString()
    );
    
    if (otherParticipant) {
      const currentUnread = conversation.unreadCount.get(otherParticipant.toString()) || 0;
      conversation.unreadCount.set(otherParticipant.toString(), currentUnread + 1);
    }

    await conversation.save();

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name profileImage');

    const populatedConversation = await Conversation.findById(conversation._id)
      .populate('participants', 'name email profileImage role sellerProfile.storeName')
      .populate('product', 'title previewImage price')
      .populate('lastMessage');

    if (otherParticipant) {
      await createNotification(otherParticipant, {
        type: 'message',
        title: 'New Message',
        message: `You have a new message from ${req.user.name}`,
        link: `/messages/${conversation._id}`
      });
    }

    const io = getIO();

    io.to(`conversation:${conversation._id.toString()}`).emit('message:new', {
      conversationId: conversation._id,
      message: populatedMessage
    });

    populatedConversation.participants.forEach((p) => {
      io.to(`user:${p._id.toString()}`).emit('conversation:upsert', populatedConversation);
    });

    res.status(201).json({
      success: true,
      data: {
        message: populatedMessage,
        conversation: populatedConversation
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.markMessagesAsRead = async (req, res) => {
  try {
    const conversationId = req.params.conversationId;

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    if (!conversation.participants.some(p => p.toString() === req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    await Message.updateMany(
      {
        conversation: conversationId,
        sender: { $ne: req.user._id },
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date()
      }
    );

    conversation.unreadCount.set(req.user._id.toString(), 0);
    await conversation.save();

    const populatedConversation = await Conversation.findById(conversation._id)
      .populate('participants', 'name email profileImage role sellerProfile.storeName')
      .populate('product', 'title previewImage price')
      .populate('lastMessage');

    const io = getIO();
    io.to(`user:${req.user._id.toString()}`).emit('conversation:upsert', populatedConversation);

    res.status(200).json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.deleteConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    if (!conversation.participants.some(p => p.toString() === req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    await Message.deleteMany({ conversation: conversation._id });
    await conversation.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Conversation deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getUnreadMessagesCount = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id
    });

    let totalUnread = 0;
    conversations.forEach(conv => {
      const unreadCount = conv.unreadCount.get(req.user._id.toString()) || 0;
      totalUnread += unreadCount;
    });

    res.status(200).json({
      success: true,
      data: { unreadCount: totalUnread }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
