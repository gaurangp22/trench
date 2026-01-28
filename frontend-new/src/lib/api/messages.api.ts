import { api } from './client'
import type {
    Conversation,
    Message,
    SendMessageRequest,
    CreateConversationRequest
} from './types'

export const MessageAPI = {
    // Get all conversations for current user
    getConversations: async (
        limit = 20,
        offset = 0
    ): Promise<{ conversations: Conversation[]; total: number }> => {
        const res = await api.get('/conversations', { params: { limit, offset } })
        return res.data
    },

    // Get a single conversation
    getConversation: async (id: string): Promise<Conversation> => {
        const res = await api.get(`/conversations/${id}`)
        return res.data
    },

    // Get messages for a conversation
    getMessages: async (
        conversationId: string,
        limit = 50,
        offset = 0
    ): Promise<{ messages: Message[]; total: number }> => {
        const res = await api.get(`/conversations/${conversationId}/messages`, {
            params: { limit, offset }
        })
        return res.data
    },

    // Send a message
    sendMessage: async (conversationId: string, data: SendMessageRequest): Promise<Message> => {
        const res = await api.post(`/conversations/${conversationId}/messages`, data)
        return res.data
    },

    // Create a new conversation
    createConversation: async (data: CreateConversationRequest): Promise<Conversation> => {
        const res = await api.post('/conversations', data)
        return res.data
    },

    // Get or create conversation for a contract
    getContractConversation: async (contractId: string): Promise<Conversation> => {
        const res = await api.get(`/contracts/${contractId}/conversation`)
        return res.data
    },

    // Mark conversation as read
    markAsRead: async (conversationId: string): Promise<void> => {
        await api.post(`/conversations/${conversationId}/read`)
    },

    // Get total unread count
    getUnreadCount: async (): Promise<number> => {
        const res = await api.get('/messages/unread-count')
        return res.data.unread_count
    }
}
