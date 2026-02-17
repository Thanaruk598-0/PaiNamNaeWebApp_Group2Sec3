import { ref, onUnmounted } from 'vue'
import { io } from 'socket.io-client'
import { useRuntimeConfig, useCookie } from '#app'

export function useChat() {
    const socket = ref(null)
    const isConnected = ref(false)
    const messages = ref([])
    const isTyping = ref(false)
    const typingTimeout = ref(null)
    const otherUserTyping = ref(false)

    const config = useRuntimeConfig()

    // Connect to Socket.IO
    const connect = () => {
        const token = useCookie('token').value || (process.client ? localStorage.getItem('token') : '')
        if (!token) return

        if (socket.value) {
            if (!socket.value.connected) socket.value.connect()
            return
        }

        // Initialize socket
        const url = config.public.apiBase.replace('/api/', '')
        socket.value = io(url, {
            auth: { token },
            transports: ['websocket', 'polling'],
        })

        socket.value.on('connect', () => {
            console.log('🔌 Socket connected')
            isConnected.value = true
        })

        socket.value.on('disconnect', () => {
            console.log('🔌 Socket disconnected')
            isConnected.value = false
        })

        socket.value.on('connect_error', (err) => {
            console.error('Socket connection error:', err)
        })

        // Listen for new messages
        socket.value.on('new_message', (message) => {
            messages.value.push(message)
            // If we are sender, scroll to bottom logic handles it
            // If we are receiver, maybe play sound?
        })

        // Listen for typing
        socket.value.on('user_typing', ({ isTyping: typing }) => {
            otherUserTyping.value = typing
        })

        // Listen for read receipt
        socket.value.on('messages_read', ({ userId }) => {
            // Mark messages from other user as read? 
            // Or just update local state if we want to show "Read" status
            messages.value.forEach(m => {
                if (m.senderId === userId) m.readAt = new Date().toISOString()
            })
        })
    }

    const joinRoom = (reportId) => {
        if (!socket.value) connect()
        socket.value?.emit('join_room', reportId)
        loadMessages(reportId)
    }

    const leaveRoom = (reportId) => {
        socket.value?.emit('leave_room', reportId)
        messages.value = []
        otherUserTyping.value = false
    }

    const sendMessage = (reportId, content) => {
        return new Promise((resolve, reject) => {
            if (!socket.value?.connected) {
                // Fallback to REST API if socket not connected
                fallbackSendMessage(reportId, content).then(resolve).catch(reject)
                return
            }

            socket.value.emit('send_message', { reportId, content }, (response) => {
                if (response.status === 'ok') {
                    resolve(response.data)
                } else {
                    reject(new Error(response.message))
                }
            })
        })
    }

    const sendTyping = (reportId, typing) => {
        socket.value?.emit('typing', { reportId, isTyping: typing })
    }

    const markRead = (reportId) => {
        socket.value?.emit('mark_read', { reportId })
    }

    // REST API fallback/loader
    const loadMessages = async (reportId) => {
        try {
            const token = useCookie('token').value
            const res = await fetch(`${config.public.apiBase}chat/${reportId}/messages`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            const body = await res.json()
            if (body.status === 'success') {
                messages.value = body.data || []
            }
        } catch (err) {
            console.error('Failed to load messages:', err)
        }
    }

    const fallbackSendMessage = async (reportId, content) => {
        const token = useCookie('token').value
        const res = await fetch(`${config.public.apiBase}chat/${reportId}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ content })
        })
        const body = await res.json()
        if (!res.ok) throw new Error(body.message || 'Failed to send')
        messages.value.push(body.data)
        return body.data
    }

    onUnmounted(() => {
        if (socket.value) {
            socket.value.disconnect()
        }
    })

    return {
        socket,
        isConnected,
        messages,
        otherUserTyping,
        connect,
        joinRoom,
        leaveRoom,
        sendMessage,
        sendTyping,
        markRead
    }
}
