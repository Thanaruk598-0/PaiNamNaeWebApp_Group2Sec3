const express = require('express');
const chatController = require('../controllers/chat.controller');
const { protect } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { sendMessageSchema } = require('../validations/chat.validation');
const chatUpload = require('../middlewares/chatUpload.middleware');

const router = express.Router();

// All chat routes require authentication
router.use(protect);

// Init or get booking chat
router.post('/booking/:bookingId/init', chatController.initBookingChat);

// Get messages for a report
router.get('/:reportId/messages', chatController.getMessages);

// Send a text message to a report chat
router.post('/:reportId/messages', validate(sendMessageSchema), chatController.sendMessage);

// Upload file/image to a report chat
router.post('/:reportId/upload', chatUpload.single('file'), chatController.uploadFile);

// Mark messages as read
router.patch('/:reportId/read', chatController.markRead);

// Get unread count
router.get('/:reportId/unread', chatController.getUnreadCount);

module.exports = router;
