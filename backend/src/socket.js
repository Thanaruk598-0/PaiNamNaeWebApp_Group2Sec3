const { Server } = require('socket.io');
const { verifyToken } = require('./utils/jwt');
const chatService = require('./services/chat.service');

let io;

function initSocket(httpServer) {
    io = new Server(httpServer, {
        cors: {
            origin: ['http://localhost:3001', 'https://amazing-crisp-9bcb1a.netlify.app'],
            credentials: true,
        },
    });

    // JWT authentication middleware
    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth?.token || socket.handshake.query?.token;
            if (!token) return next(new Error('Authentication required'));

            const decoded = verifyToken(token);
            socket.user = { sub: decoded.sub, role: decoded.role };
            next();
        } catch (err) {
            next(new Error('Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`🔌 Socket connected: ${socket.user.sub} (${socket.user.role})`);

        // Join a report chat room
        socket.on('join_room', (reportId) => {
            socket.join(`report:${reportId}`);
            console.log(`📨 User ${socket.user.sub} joined room report:${reportId}`);
        });

        // Leave a report chat room
        socket.on('leave_room', (reportId) => {
            socket.leave(`report:${reportId}`);
        });

        // Send a message
        socket.on('send_message', async ({ reportId, content }, callback) => {
            try {
                const message = await chatService.createMessage(reportId, socket.user.sub, content);
                // Broadcast to everyone in the room (including sender)
                io.to(`report:${reportId}`).emit('new_message', message);
                if (callback) callback({ status: 'ok', data: message });
            } catch (err) {
                console.error('Socket send_message error:', err);
                if (callback) callback({ status: 'error', message: err.message });
            }
        });

        // Typing indicator
        socket.on('typing', ({ reportId, isTyping }) => {
            socket.to(`report:${reportId}`).emit('user_typing', {
                userId: socket.user.sub,
                role: socket.user.role,
                isTyping,
            });
        });

        // Mark messages as read
        socket.on('mark_read', async ({ reportId }) => {
            try {
                await chatService.markRead(reportId, socket.user.sub);
                socket.to(`report:${reportId}`).emit('messages_read', {
                    userId: socket.user.sub,
                    reportId,
                });
            } catch (err) {
                console.error('Socket mark_read error:', err);
            }
        });

        socket.on('disconnect', () => {
            console.log(`🔌 Socket disconnected: ${socket.user.sub}`);
        });
    });

    return io;
}

function getIO() {
    return io;
}

module.exports = { initSocket, getIO };
