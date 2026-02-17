const asyncHandler = require('express-async-handler');
const chatService = require('../services/chat.service');

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

module.exports = {
    getMessages,
    sendMessage,
    markRead,
    getUnreadCount,
};
