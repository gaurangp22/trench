import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import {
    ChatWebSocket,
    getChatWebSocket,
    resetChatWebSocket,
    type Message,
    type Conversation,
    type Attachment,
} from '@/lib/websocket/ChatWebSocket'

interface TypingUser {
    user_id: string
    username: string
    conversation_id: string
}

interface ChatContextType {
    // Connection state
    isConnected: boolean
    connecting: boolean

    // Conversations
    conversations: Conversation[]
    loadingConversations: boolean
    refreshConversations: () => Promise<void>

    // Current conversation
    selectedConversation: Conversation | null
    selectConversation: (conversation: Conversation | null) => void

    // Messages for selected conversation
    messages: Message[]
    loadingMessages: boolean
    hasMoreMessages: boolean
    loadMoreMessages: () => Promise<void>

    // Actions
    sendMessage: (text: string, attachments?: Attachment[]) => Promise<void>
    createConversation: (participantId: string, options?: {
        contractId?: string
        jobId?: string
        initialMessage?: string
    }) => Promise<Conversation>
    markAsRead: (conversationId: string) => Promise<void>
    sendTyping: (isTyping: boolean) => void

    // Typing indicators
    typingUsers: TypingUser[]

    // Online status
    onlineUsers: Set<string>

    // Total unread
    totalUnread: number
}

const ChatContext = createContext<ChatContextType | null>(null)

export function ChatProvider({ children }: { children: React.ReactNode }) {
    const wsRef = useRef<ChatWebSocket | null>(null)
    const [isConnected, setIsConnected] = useState(false)
    const [connecting, setConnecting] = useState(false)

    // Conversations state
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [loadingConversations, setLoadingConversations] = useState(false)
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)

    // Ref to track current selected conversation (for WebSocket callbacks)
    const selectedConversationIdRef = useRef<string | null>(null)

    // Messages state
    const [messages, setMessages] = useState<Message[]>([])
    const [loadingMessages, setLoadingMessages] = useState(false)
    const [hasMoreMessages, setHasMoreMessages] = useState(true)
    const [messageOffset, setMessageOffset] = useState(0)

    // Typing state
    const [typingUsers, setTypingUsers] = useState<TypingUser[]>([])
    const typingTimeouts = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

    // Online users
    const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())

    // Calculate total unread
    const totalUnread = conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0)

    // Keep ref in sync with selected conversation (for WebSocket callbacks)
    useEffect(() => {
        selectedConversationIdRef.current = selectedConversation?.id || null
    }, [selectedConversation?.id])

    // Initialize WebSocket connection
    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) return

        const connect = async () => {
            setConnecting(true)
            try {
                const ws = getChatWebSocket()
                wsRef.current = ws

                // Set up event handlers before connecting
                ws.onConnection((connected) => {
                    setIsConnected(connected)
                    if (connected) {
                        // Refresh conversations when reconnected
                        refreshConversations()
                    }
                })

                ws.onMessage((message) => {
                    handleNewMessage(message)
                })

                ws.onTyping((data) => {
                    handleTyping(data)
                })

                ws.onPresence((data) => {
                    handlePresence(data)
                })

                await ws.connect(token)
            } catch (error) {
                console.error('Failed to connect WebSocket:', error)
            } finally {
                setConnecting(false)
            }
        }

        connect()

        return () => {
            resetChatWebSocket()
            wsRef.current = null
        }
    }, [])

    // Load messages when conversation changes
    useEffect(() => {
        if (selectedConversation) {
            loadMessages(selectedConversation.id, true)
            // Join conversation for real-time updates
            wsRef.current?.joinConversation(selectedConversation.id)
        }

        return () => {
            if (selectedConversation) {
                wsRef.current?.leaveConversation(selectedConversation.id)
            }
        }
    }, [selectedConversation?.id])

    const handleNewMessage = useCallback((message: Message) => {
        // Use ref to get current selected conversation (avoids stale closure)
        const currentConversationId = selectedConversationIdRef.current

        // Add message to current conversation if it matches
        if (currentConversationId === message.conversation_id) {
            setMessages(prev => {
                // Avoid duplicates
                if (prev.some(m => m.id === message.id)) return prev
                return [...prev, message]
            })
        }

        // Update conversation's last message
        setConversations(prev => prev.map(conv => {
            if (conv.id === message.conversation_id) {
                return {
                    ...conv,
                    last_message: message,
                    updated_at: message.created_at,
                    // Increment unread if not the current conversation
                    unread_count: currentConversationId === conv.id
                        ? conv.unread_count
                        : conv.unread_count + 1,
                }
            }
            return conv
        }))
    }, [])

    const handleTyping = useCallback((data: { conversation_id: string; user_id: string; username: string; is_typing: boolean }) => {
        const key = `${data.conversation_id}-${data.user_id}`

        // Clear existing timeout
        const existingTimeout = typingTimeouts.current.get(key)
        if (existingTimeout) {
            clearTimeout(existingTimeout)
            typingTimeouts.current.delete(key)
        }

        if (data.is_typing) {
            // Add typing user
            setTypingUsers(prev => {
                const exists = prev.some(u => u.user_id === data.user_id && u.conversation_id === data.conversation_id)
                if (exists) return prev
                return [...prev, {
                    user_id: data.user_id,
                    username: data.username,
                    conversation_id: data.conversation_id,
                }]
            })

            // Auto-remove after 3 seconds
            const timeout = setTimeout(() => {
                setTypingUsers(prev => prev.filter(u =>
                    !(u.user_id === data.user_id && u.conversation_id === data.conversation_id)
                ))
                typingTimeouts.current.delete(key)
            }, 3000)
            typingTimeouts.current.set(key, timeout)
        } else {
            // Remove typing user
            setTypingUsers(prev => prev.filter(u =>
                !(u.user_id === data.user_id && u.conversation_id === data.conversation_id)
            ))
        }
    }, [])

    const handlePresence = useCallback((data: { user_id: string; is_online: boolean }) => {
        setOnlineUsers(prev => {
            const next = new Set(prev)
            if (data.is_online) {
                next.add(data.user_id)
            } else {
                next.delete(data.user_id)
            }
            return next
        })

        // Update participant online status in conversations
        setConversations(prev => prev.map(conv => ({
            ...conv,
            participants: conv.participants.map(p =>
                p.user_id === data.user_id
                    ? { ...p, is_online: data.is_online }
                    : p
            ),
        })))
    }, [])

    const refreshConversations = useCallback(async () => {
        if (!wsRef.current?.isConnected) return

        setLoadingConversations(true)
        try {
            const result = await wsRef.current.getConversations()
            setConversations(result.conversations || [])
        } catch (error) {
            console.error('Failed to load conversations:', error)
        } finally {
            setLoadingConversations(false)
        }
    }, [])

    const loadMessages = useCallback(async (conversationId: string, reset = false) => {
        if (!wsRef.current?.isConnected) return

        setLoadingMessages(true)
        try {
            const offset = reset ? 0 : messageOffset
            const result = await wsRef.current.getMessages(conversationId, 50, offset)
            const newMessages = (result.messages || []).reverse() // Oldest first

            if (reset) {
                setMessages(newMessages)
                setMessageOffset(newMessages.length)
            } else {
                setMessages(prev => [...newMessages, ...prev])
                setMessageOffset(prev => prev + newMessages.length)
            }

            setHasMoreMessages(newMessages.length === 50)

            // Mark as read
            if (newMessages.length > 0) {
                wsRef.current.markAsRead(conversationId)
            }
        } catch (error) {
            console.error('Failed to load messages:', error)
        } finally {
            setLoadingMessages(false)
        }
    }, [messageOffset])

    const loadMoreMessages = useCallback(async () => {
        if (!selectedConversation || !hasMoreMessages || loadingMessages) return
        await loadMessages(selectedConversation.id, false)
    }, [selectedConversation, hasMoreMessages, loadingMessages, loadMessages])

    const sendMessage = useCallback(async (text: string, attachments?: Attachment[]) => {
        if (!wsRef.current?.isConnected || !selectedConversation) {
            throw new Error('Not connected or no conversation selected')
        }

        const message = await wsRef.current.sendMessage(selectedConversation.id, text, attachments)

        // Add to messages (optimistic update was already done via notification)
        setMessages(prev => {
            // Avoid duplicate if already added via notification
            if (prev.some(m => m.id === message.id)) return prev
            return [...prev, message]
        })
    }, [selectedConversation])

    const createConversation = useCallback(async (participantId: string, options?: {
        contractId?: string
        jobId?: string
        initialMessage?: string
    }) => {
        if (!wsRef.current?.isConnected) {
            throw new Error('Not connected')
        }

        const conversation = await wsRef.current.createConversation(participantId, options)

        // Add to conversations list
        setConversations(prev => {
            if (prev.some(c => c.id === conversation.id)) return prev
            return [conversation, ...prev]
        })

        return conversation
    }, [])

    const markAsRead = useCallback(async (conversationId: string) => {
        if (!wsRef.current?.isConnected) return

        await wsRef.current.markAsRead(conversationId)

        // Update local state
        setConversations(prev => prev.map(conv =>
            conv.id === conversationId
                ? { ...conv, unread_count: 0 }
                : conv
        ))
    }, [])

    const sendTyping = useCallback((isTyping: boolean) => {
        if (!wsRef.current?.isConnected || !selectedConversation) return
        wsRef.current.sendTyping(selectedConversation.id, isTyping)
    }, [selectedConversation])

    const selectConversation = useCallback((conversation: Conversation | null) => {
        setSelectedConversation(conversation)
        setMessages([])
        setMessageOffset(0)
        setHasMoreMessages(true)
    }, [])

    const value: ChatContextType = {
        isConnected,
        connecting,
        conversations,
        loadingConversations,
        refreshConversations,
        selectedConversation,
        selectConversation,
        messages,
        loadingMessages,
        hasMoreMessages,
        loadMoreMessages,
        sendMessage,
        createConversation,
        markAsRead,
        sendTyping,
        typingUsers,
        onlineUsers,
        totalUnread,
    }

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    )
}

export function useChat(): ChatContextType {
    const context = useContext(ChatContext)
    if (!context) {
        throw new Error('useChat must be used within a ChatProvider')
    }
    return context
}
