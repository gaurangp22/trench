// JSON-RPC 2.0 WebSocket Client for Chat

export interface Attachment {
    url: string
    file_name: string
    file_type: string
    file_size: number
}

export interface Message {
    id: string
    conversation_id: string
    sender_id: string
    sender_username: string
    sender_avatar?: string
    message_text: string
    message_type: 'text' | 'system' | 'milestone_update'
    is_edited: boolean
    attachments?: Attachment[]
    created_at: string
}

export interface Participant {
    user_id: string
    username: string
    avatar_url?: string
    is_online: boolean
}

export interface ConversationContext {
    type: 'contract' | 'job' | 'proposal'
    id: string
    title: string
    status?: string
    amount_sol?: string
}

export interface Conversation {
    id: string
    participants: Participant[]
    last_message?: Message
    unread_count: number
    context?: ConversationContext
    updated_at: string
    created_at: string
}

interface RPCRequest {
    jsonrpc: '2.0'
    method: string
    params?: unknown
    id: number
}

interface RPCResponse {
    jsonrpc: '2.0'
    result?: unknown
    error?: {
        code: number
        message: string
        data?: unknown
    }
    id: number | null
}

interface RPCNotification {
    jsonrpc: '2.0'
    method: string
    params?: unknown
}

type PendingRequest = {
    resolve: (value: unknown) => void
    reject: (error: Error) => void
    timeout: ReturnType<typeof setTimeout>
}

export type MessageHandler = (message: Message) => void
export type TypingHandler = (data: { conversation_id: string; user_id: string; username: string; is_typing: boolean }) => void
export type PresenceHandler = (data: { user_id: string; is_online: boolean }) => void
export type ReadReceiptHandler = (data: { conversation_id: string; user_id: string; read_at: string }) => void
export type ConnectionHandler = (connected: boolean) => void

export class ChatWebSocket {
    private ws: WebSocket | null = null
    private requestId = 0
    private pendingRequests = new Map<number, PendingRequest>()
    private reconnectAttempts = 0
    private maxReconnectAttempts = 5
    private reconnectDelay = 1000
    private token: string | null = null
    private baseUrl: string

    // Event handlers
    private messageHandlers: MessageHandler[] = []
    private typingHandlers: TypingHandler[] = []
    private presenceHandlers: PresenceHandler[] = []
    private readReceiptHandlers: ReadReceiptHandler[] = []
    private connectionHandlers: ConnectionHandler[] = []

    constructor(baseUrl?: string) {
        const apiUrl = baseUrl || import.meta.env.VITE_API_URL || 'http://localhost:8080'
        // Convert http(s) to ws(s)
        this.baseUrl = apiUrl.replace(/^http/, 'ws')
    }

    async connect(token: string): Promise<void> {
        this.token = token
        return this.doConnect()
    }

    private doConnect(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.ws?.readyState === WebSocket.OPEN) {
                resolve()
                return
            }

            // Pass token as query parameter (browsers don't send Authorization header for WebSocket)
            const url = `${this.baseUrl}/api/v1/ws?token=${encodeURIComponent(this.token || '')}`
            this.ws = new WebSocket(url)
            this.ws.onopen = () => {
                console.log('WebSocket connected')
                this.reconnectAttempts = 0
                this.notifyConnectionHandlers(true)
                resolve()
            }

            this.ws.onclose = (event) => {
                console.log('WebSocket closed:', event.code, event.reason)
                this.notifyConnectionHandlers(false)
                this.handleReconnect()
            }

            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error)
                reject(new Error('WebSocket connection failed'))
            }

            this.ws.onmessage = (event) => {
                this.handleMessage(event.data)
            }
        })
    }

    private handleReconnect(): void {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('Max reconnection attempts reached')
            return
        }

        this.reconnectAttempts++
        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)

        console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`)

        setTimeout(() => {
            if (this.token) {
                this.doConnect().catch(console.error)
            }
        }, delay)
    }

    disconnect(): void {
        if (this.ws) {
            this.ws.close(1000, 'Client disconnect')
            this.ws = null
        }
        this.pendingRequests.forEach(({ reject, timeout }) => {
            clearTimeout(timeout)
            reject(new Error('Connection closed'))
        })
        this.pendingRequests.clear()
    }

    private handleMessage(data: string): void {
        try {
            const message = JSON.parse(data) as RPCResponse | RPCNotification

            // Check if it's a response to a request
            if ('id' in message && message.id !== null) {
                const pending = this.pendingRequests.get(message.id)
                if (pending) {
                    clearTimeout(pending.timeout)
                    this.pendingRequests.delete(message.id)

                    if (message.error) {
                        pending.reject(new Error(message.error.message))
                    } else {
                        pending.resolve(message.result)
                    }
                }
            } else if ('method' in message) {
                // It's a notification from server
                this.handleNotification(message as RPCNotification)
            }
        } catch (error) {
            console.error('Failed to parse WebSocket message:', error)
        }
    }

    private handleNotification(notification: RPCNotification): void {
        switch (notification.method) {
            case 'chat.newMessage':
                const msgData = notification.params as { message: Message }
                this.messageHandlers.forEach(h => h(msgData.message))
                break

            case 'chat.userTyping':
                const typingData = notification.params as { conversation_id: string; user_id: string; username: string; is_typing: boolean }
                this.typingHandlers.forEach(h => h(typingData))
                break

            case 'chat.presence':
                const presenceData = notification.params as { user_id: string; is_online: boolean }
                this.presenceHandlers.forEach(h => h(presenceData))
                break

            case 'chat.readReceipt':
                const readData = notification.params as { conversation_id: string; user_id: string; read_at: string }
                this.readReceiptHandlers.forEach(h => h(readData))
                break

            default:
                console.log('Unknown notification:', notification.method)
        }
    }

    private async sendRequest<T>(method: string, params?: unknown): Promise<T> {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            throw new Error('WebSocket not connected')
        }

        const id = ++this.requestId
        const request: RPCRequest = {
            jsonrpc: '2.0',
            method,
            params,
            id,
        }

        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                this.pendingRequests.delete(id)
                reject(new Error('Request timeout'))
            }, 30000) // 30 second timeout

            this.pendingRequests.set(id, {
                resolve: resolve as (value: unknown) => void,
                reject,
                timeout,
            })

            this.ws!.send(JSON.stringify(request))
        })
    }

    // Chat methods

    async sendMessage(conversationId: string, text: string, attachments?: Attachment[]): Promise<Message> {
        return this.sendRequest<Message>('chat.sendMessage', {
            conversation_id: conversationId,
            text,
            attachments,
        })
    }

    async getMessages(conversationId: string, limit = 50, offset = 0): Promise<{ messages: Message[]; total: number }> {
        return this.sendRequest<{ messages: Message[]; total: number }>('chat.getMessages', {
            conversation_id: conversationId,
            limit,
            offset,
        })
    }

    async getConversations(limit = 20, offset = 0): Promise<{ conversations: Conversation[]; total: number }> {
        return this.sendRequest<{ conversations: Conversation[]; total: number }>('chat.getConversations', {
            limit,
            offset,
        })
    }

    async createConversation(participantId: string, options?: {
        contractId?: string
        jobId?: string
        initialMessage?: string
    }): Promise<Conversation> {
        return this.sendRequest<Conversation>('chat.createConversation', {
            participant_id: participantId,
            contract_id: options?.contractId,
            job_id: options?.jobId,
            initial_message: options?.initialMessage,
        })
    }

    async markAsRead(conversationId: string): Promise<void> {
        await this.sendRequest('chat.markRead', {
            conversation_id: conversationId,
        })
    }

    async sendTyping(conversationId: string, isTyping: boolean): Promise<void> {
        await this.sendRequest('chat.typing', {
            conversation_id: conversationId,
            is_typing: isTyping,
        })
    }

    async joinConversation(conversationId: string): Promise<{ success: boolean; conversation: Conversation }> {
        return this.sendRequest<{ success: boolean; conversation: Conversation }>('chat.joinConversation', {
            conversation_id: conversationId,
        })
    }

    async leaveConversation(conversationId: string): Promise<void> {
        await this.sendRequest('chat.leaveConversation', {
            conversation_id: conversationId,
        })
    }

    // Event subscriptions

    onMessage(handler: MessageHandler): () => void {
        this.messageHandlers.push(handler)
        return () => {
            const index = this.messageHandlers.indexOf(handler)
            if (index > -1) this.messageHandlers.splice(index, 1)
        }
    }

    onTyping(handler: TypingHandler): () => void {
        this.typingHandlers.push(handler)
        return () => {
            const index = this.typingHandlers.indexOf(handler)
            if (index > -1) this.typingHandlers.splice(index, 1)
        }
    }

    onPresence(handler: PresenceHandler): () => void {
        this.presenceHandlers.push(handler)
        return () => {
            const index = this.presenceHandlers.indexOf(handler)
            if (index > -1) this.presenceHandlers.splice(index, 1)
        }
    }

    onReadReceipt(handler: ReadReceiptHandler): () => void {
        this.readReceiptHandlers.push(handler)
        return () => {
            const index = this.readReceiptHandlers.indexOf(handler)
            if (index > -1) this.readReceiptHandlers.splice(index, 1)
        }
    }

    onConnection(handler: ConnectionHandler): () => void {
        this.connectionHandlers.push(handler)
        return () => {
            const index = this.connectionHandlers.indexOf(handler)
            if (index > -1) this.connectionHandlers.splice(index, 1)
        }
    }

    private notifyConnectionHandlers(connected: boolean): void {
        this.connectionHandlers.forEach(h => h(connected))
    }

    get isConnected(): boolean {
        return this.ws?.readyState === WebSocket.OPEN
    }
}

// Singleton instance
let chatWSInstance: ChatWebSocket | null = null

export function getChatWebSocket(): ChatWebSocket {
    if (!chatWSInstance) {
        chatWSInstance = new ChatWebSocket()
    }
    return chatWSInstance
}

export function resetChatWebSocket(): void {
    if (chatWSInstance) {
        chatWSInstance.disconnect()
        chatWSInstance = null
    }
}
