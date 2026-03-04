const prisma = require('../utils/prisma');
const ApiError = require('../utils/ApiError');

/**
 * Get messages for a report (with pagination)
 */
const getMessages = async (reportId, opts = {}) => {
    const { page = 1, limit = 50 } = opts;
    const skip = (page - 1) * limit;

    // Verify report exists
    const report = await prisma.report.findUnique({ where: { id: reportId } });
    if (!report) throw new ApiError(404, 'Report not found');

    const [total, data] = await prisma.$transaction([
        prisma.chatMessage.count({ where: { reportId } }),
        prisma.chatMessage.findMany({
            where: { reportId },
            orderBy: { createdAt: 'asc' },
            skip,
            take: limit,
        }),
    ]);

    return {
        data,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
};

/**
 * Create a new chat message
 */
const createMessage = async (reportId, senderId, content, { fileUrl, fileType, fileName } = {}) => {
    // Verify report exists
    const report = await prisma.report.findUnique({ where: { id: reportId } });
    if (!report) throw new ApiError(404, 'Report not found');

    return prisma.chatMessage.create({
        data: {
            reportId,
            senderId,
            content: content || '',
            ...(fileUrl && { fileUrl }),
            ...(fileType && { fileType }),
            ...(fileName && { fileName }),
        },
    });
};

/**
 * Mark messages as read for a user in a report
 */
const markRead = async (reportId, userId) => {
    await prisma.chatMessage.updateMany({
        where: {
            reportId,
            senderId: { not: userId },
            readAt: null,
        },
        data: { readAt: new Date() },
    });
    return { success: true };
};

/**
 * Get unread count for a report (messages not sent by this user)
 */
const getUnreadCount = async (reportId, userId) => {
    const count = await prisma.chatMessage.count({
        where: {
            reportId,
            senderId: { not: userId },
            readAt: null,
        },
    });
    return count;
};

module.exports = {
    getMessages,
    createMessage,
    markRead,
    getUnreadCount,
};
