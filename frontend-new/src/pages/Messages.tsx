import { useState, useEffect, useRef } from "react"
import { Search, Shield, Send, Paperclip, MoreVertical, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { cn } from "@/lib/utils"
import { MessageAPI, type Conversation, type Message } from "@/lib/api"

export function Messages() {
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState("")
    const [loading, setLoading] = useState(true)
    const [messagesLoading, setMessagesLoading] = useState(false)
    const [sending, setSending] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Get current user ID from token (simplified - in real app use auth context)
    const getCurrentUserId = () => {
        const token = localStorage.getItem('token')
        if (!token) return null
        try {
            const payload = JSON.parse(atob(token.split('.')[1]))
            return payload.user_id
        } catch {
            return null
        }
    }

    const currentUserId = getCurrentUserId()

    // Fetch conversations
    useEffect(() => {
        const loadConversations = async () => {
            try {
                setLoading(true)
                const data = await MessageAPI.getConversations()
                setConversations(data.conversations || [])
                if (data.conversations && data.conversations.length > 0) {
                    setSelectedConversation(data.conversations[0])
                }
            } catch (error) {
                console.error("Failed to load conversations:", error)
            } finally {
                setLoading(false)
            }
        }

        loadConversations()
    }, [])

    // Fetch messages when conversation changes
    useEffect(() => {
        if (!selectedConversation) return

        const loadMessages = async () => {
            try {
                setMessagesLoading(true)
                const data = await MessageAPI.getMessages(selectedConversation.id)
                // Reverse to show oldest first
                setMessages((data.messages || []).reverse())
                // Mark as read
                MessageAPI.markAsRead(selectedConversation.id)
            } catch (error) {
                console.error("Failed to load messages:", error)
            } finally {
                setMessagesLoading(false)
            }
        }

        loadMessages()
    }, [selectedConversation?.id])

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const handleSend = async () => {
        if (!newMessage.trim() || !selectedConversation || sending) return

        try {
            setSending(true)
            const message = await MessageAPI.sendMessage(selectedConversation.id, {
                message_text: newMessage.trim()
            })
            setMessages(prev => [...prev, message])
            setNewMessage("")

            // Update conversation's last message in list
            setConversations(prev => prev.map(conv =>
                conv.id === selectedConversation.id
                    ? { ...conv, last_message: message, updated_at: message.created_at }
                    : conv
            ))
        } catch (error) {
            console.error("Failed to send message:", error)
        } finally {
            setSending(false)
        }
    }

    const getOtherParticipant = (conv: Conversation) => {
        return conv.participants?.find(p => p.user_id !== currentUserId) || conv.participants?.[0]
    }

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr)
        const now = new Date()
        const diff = now.getTime() - date.getTime()
        const hours = Math.floor(diff / (1000 * 60 * 60))
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))

        if (hours < 1) return "Just now"
        if (hours < 24) return `${hours}h ago`
        if (days < 7) return `${days}d ago`
        return date.toLocaleDateString()
    }

    const formatMessageTime = (dateStr: string) => {
        const date = new Date(dateStr)
        const now = new Date()
        const isToday = date.toDateString() === now.toDateString()
        const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

        if (isToday) return time
        return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${time}`
    }

    const filteredConversations = conversations.filter(conv => {
        if (!searchQuery) return true
        const participant = getOtherParticipant(conv)
        return participant?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
               conv.context?.title?.toLowerCase().includes(searchQuery.toLowerCase())
    })

    // Empty state
    if (!loading && conversations.length === 0) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] pt-20 pb-0">
                <div className="container max-w-6xl mx-auto px-6 h-[calc(100vh-80px)] flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-zinc-800 flex items-center justify-center">
                            <MessageSquare className="w-8 h-8 text-zinc-500" />
                        </div>
                        <h2 className="text-xl font-semibold text-white mb-2">No messages yet</h2>
                        <p className="text-zinc-400 max-w-sm mx-auto">
                            Start a conversation by applying to a job or hiring a freelancer.
                            Messages will appear here.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] pt-20 pb-0">
            <div className="container max-w-6xl mx-auto px-6 h-[calc(100vh-80px)]">
                <div className="flex h-full bg-zinc-900/30 border border-zinc-800 rounded-xl overflow-hidden">
                    {/* Conversation List */}
                    <div className="w-80 border-r border-zinc-800 flex flex-col">
                        {/* Search */}
                        <div className="p-4 border-b border-zinc-800">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                <input
                                    type="text"
                                    placeholder="Search messages..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                />
                            </div>
                        </div>

                        {/* Conversations */}
                        <div className="flex-1 overflow-y-auto">
                            {loading ? (
                                <div className="p-4 text-center text-zinc-500">Loading...</div>
                            ) : (
                                filteredConversations.map((conv) => {
                                    const participant = getOtherParticipant(conv)
                                    return (
                                        <button
                                            key={conv.id}
                                            onClick={() => setSelectedConversation(conv)}
                                            className={cn(
                                                "w-full p-4 flex items-start gap-3 text-left transition-colors",
                                                selectedConversation?.id === conv.id
                                                    ? "bg-zinc-800/50"
                                                    : "hover:bg-zinc-800/30"
                                            )}
                                        >
                                            <div className="relative">
                                                {participant?.avatar_url ? (
                                                    <img
                                                        src={participant.avatar_url}
                                                        alt={participant.username}
                                                        className="w-12 h-12 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                                                        {participant?.username?.[0]?.toUpperCase() || '?'}
                                                    </div>
                                                )}
                                                {participant?.is_online && (
                                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-zinc-900" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="font-medium text-white truncate">
                                                        {participant?.username || 'Unknown'}
                                                    </span>
                                                    <span className="text-xs text-zinc-500">
                                                        {conv.last_message ? formatTime(conv.last_message.created_at) : ''}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-zinc-400 truncate">
                                                    {conv.last_message?.message_text || 'No messages yet'}
                                                </p>
                                                {conv.context && (
                                                    <div className="flex items-center gap-1 mt-1.5 text-xs text-emerald-400">
                                                        <Shield className="w-3 h-3" />
                                                        <span className="truncate">{conv.context.title}</span>
                                                        {conv.context.amount_sol && (
                                                            <span>◎ {conv.context.amount_sol}</span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            {conv.unread_count > 0 && (
                                                <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center text-xs text-white">
                                                    {conv.unread_count}
                                                </div>
                                            )}
                                        </button>
                                    )
                                })
                            )}
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 flex flex-col">
                        {selectedConversation ? (
                            <>
                                {/* Chat Header */}
                                <div className="p-4 border-b border-zinc-800">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {(() => {
                                                const participant = getOtherParticipant(selectedConversation)
                                                return (
                                                    <>
                                                        {participant?.avatar_url ? (
                                                            <img
                                                                src={participant.avatar_url}
                                                                alt={participant.username}
                                                                className="w-10 h-10 rounded-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                                                                {participant?.username?.[0]?.toUpperCase() || '?'}
                                                            </div>
                                                        )}
                                                        <div>
                                                            <h3 className="font-medium text-white">
                                                                {participant?.username || 'Unknown'}
                                                            </h3>
                                                            {participant?.is_online && (
                                                                <span className="text-xs text-green-400">Online</span>
                                                            )}
                                                        </div>
                                                    </>
                                                )
                                            })()}
                                        </div>
                                        <Button variant="ghost" size="icon" className="text-zinc-400">
                                            <MoreVertical className="w-5 h-5" />
                                        </Button>
                                    </div>

                                    {/* Pinned Context */}
                                    {selectedConversation.context && (
                                        <div className="mt-3 p-3 bg-zinc-800/50 border border-zinc-700 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Shield className="w-4 h-4 text-emerald-400" />
                                                    <span className="text-sm text-white">{selectedConversation.context.title}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    {selectedConversation.context.amount_sol && (
                                                        <span className="text-sm font-medium text-white">
                                                            ◎ {selectedConversation.context.amount_sol} SOL
                                                        </span>
                                                    )}
                                                    {selectedConversation.context.status && (
                                                        <span className={cn(
                                                            "px-2 py-0.5 rounded text-xs capitalize",
                                                            selectedConversation.context.status === "funded" || selectedConversation.context.status === "active"
                                                                ? "bg-emerald-500/10 text-emerald-400"
                                                                : "bg-blue-500/10 text-blue-400"
                                                        )}>
                                                            {selectedConversation.context.status.replace('_', ' ')}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                    {messagesLoading ? (
                                        <div className="text-center text-zinc-500 py-8">Loading messages...</div>
                                    ) : messages.length === 0 ? (
                                        <div className="text-center text-zinc-500 py-8">
                                            No messages yet. Start the conversation!
                                        </div>
                                    ) : (
                                        messages.map((msg) => {
                                            const isMe = msg.sender_id === currentUserId
                                            return (
                                                <div
                                                    key={msg.id}
                                                    className={cn(
                                                        "flex",
                                                        isMe ? "justify-end" : "justify-start"
                                                    )}
                                                >
                                                    {msg.message_type === 'system' ? (
                                                        <div className="text-xs text-zinc-500 text-center w-full py-2">
                                                            {msg.message_text}
                                                        </div>
                                                    ) : (
                                                        <div className={cn(
                                                            "max-w-[70%] p-3 rounded-2xl",
                                                            isMe
                                                                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                                                                : "bg-zinc-800 text-zinc-100"
                                                        )}>
                                                            <p className="text-sm whitespace-pre-wrap">{msg.message_text}</p>
                                                            <span className={cn(
                                                                "text-xs mt-1 block",
                                                                isMe ? "text-white/70" : "text-zinc-500"
                                                            )}>
                                                                {formatMessageTime(msg.created_at)}
                                                                {msg.is_edited && " (edited)"}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Message Input */}
                                <div className="p-4 border-t border-zinc-800">
                                    <div className="flex items-center gap-3">
                                        <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
                                            <Paperclip className="w-5 h-5" />
                                        </Button>
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                                            placeholder="Type a message..."
                                            disabled={sending}
                                            className="flex-1 px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 disabled:opacity-50"
                                        />
                                        <Button
                                            onClick={handleSend}
                                            disabled={!newMessage.trim() || sending}
                                            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white disabled:opacity-50"
                                        >
                                            <Send className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center">
                                <div className="text-center text-zinc-500">
                                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>Select a conversation to start messaging</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
