const asyncHandler = require('express-async-handler');
const chatService = require('../services/chat.service');
const { uploadToCloudinary } = require('../utils/cloudinary');

/** GET /api/chat/:reportId/messages */
const getMessages = asyncHandler(async (req, res) => {
    const { reportId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    const result = await chatService.getMessages(reportId, { page, limit });
    res.json({ status: 'success', ...result });
});

/** POST /api/chat/:reportId/messages */
const sendMessage = asyncHandler(async (req, res) => {
    const { reportId } = req.params;
    const senderId = req.user.sub;
    const { content } = req.body;

    const message = await chatService.createMessage(reportId, senderId, content);
    res.status(201).json({ status: 'success', data: message });
});

/** POST /api/chat/:reportId/upload — ส่งข้อความพร้อมไฟล์แนบ */
const uploadFile = asyncHandler(async (req, res) => {
    const { reportId } = req.params;
    const senderId = req.user.sub;
    const content = req.body.content || '';

    if (!req.file) {
        return res.status(400).json({ status: 'error', message: 'กรุณาแนบไฟล์' });
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, 'painamnae/chat');
    const fileType = req.file.mimetype.startsWith('image/') ? 'image' : 'file';

    const message = await chatService.createMessage(reportId, senderId, content, {
        fileUrl: result.url,
        fileType,
        fileName: req.file.originalname,
    });

    // Emit via Socket.IO if available
    try {
        const { getIO } = require('../socket');
        const io = getIO();
        if (io) {
            io.to(`report:${reportId}`).emit('new_message', message);
        }
    } catch (e) {
        // Socket not initialized, skip
    }

    res.status(201).json({ status: 'success', data: message });
});

/** PATCH /api/chat/:reportId/read */
const markRead = asyncHandler(async (req, res) => {
    const { reportId } = req.params;
    const userId = req.user.sub;

    const result = await chatService.markRead(reportId, userId);
    res.json({ status: 'success', data: result });
});

/** GET /api/chat/:reportId/unread */
const getUnreadCount = asyncHandler(async (req, res) => {
    const { reportId } = req.params;
    const userId = req.user.sub;

    const count = await chatService.getUnreadCount(reportId, userId);
    res.json({ status: 'success', data: { unreadCount: count } });
});

/** POST /api/chat/booking/:bookingId/init */
const initBookingChat = asyncHandler(async (req, res) => {
    const { bookingId } = req.params;
    const userId = req.user.sub;

    const result = await chatService.initBookingChat(bookingId, userId);
    res.status(200).json({ status: 'success', data: result });
});

module.exports = {
    getMessages,
    sendMessage,
    uploadFile,
    markRead,
    getUnreadCount,
    initBookingChat,
};
