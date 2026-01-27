import { useEffect, useRef, useState } from "react"
import { useSearchParams, Link } from "react-router-dom"
import { Search, Shield, MoreVertical, MessageSquare, Briefcase, Users, WifiOff } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { cn } from "@/lib/utils"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { useAuth } from "@/context/AuthContext"
import { useChat } from "@/context/ChatContext"
import { MessageInput } from "@/components/chat/MessageInput"
import { MessageAttachments } from "@/components/chat/MessageAttachment"

export function Messages() {
    const { user } = useAuth()
    const currentRole = user?.role || 'freelancer'
    const [searchQuery, setSearchQuery] = useState("")
    const messagesContainerRef = useRef<HTMLDivElement>(null)
    const [searchParams] = useSearchParams()
    const conversationIdFromUrl = searchParams.get('conversation')

    const {
        isConnected,
        connecting,
        conversations,
        loadingConversations,
        refreshConversations,
        selectedConversation,
        selectConversation,
        messages,
        loadingMessages,
        sendMessage,
        sendTyping,
        typingUsers,
        markAsRead,
    } = useChat()

    // Get current user ID from token
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

    // Load conversations on mount
    useEffect(() => {
        if (isConnected) {
            refreshConversations()
        }
    }, [isConnected, refreshConversations])

    // Select conversation from URL or first one
    useEffect(() => {
        if (conversations.length > 0 && !selectedConversation) {
            if (conversationIdFromUrl) {
                const targetConv = conversations.find(c => c.id === conversationIdFromUrl)
                if (targetConv) {
                    selectConversation(targetConv)
                    return
                }
            }
            selectConversation(conversations[0])
        }
    }, [conversations, conversationIdFromUrl, selectedConversation, selectConversation])

    // Mark as read when selecting conversation
    useEffect(() => {
        if (selectedConversation && selectedConversation.unread_count > 0) {
            markAsRead(selectedConversation.id)
        }
    }, [selectedConversation?.id, selectedConversation?.unread_count, markAsRead])

    // Scroll to bottom when messages change
    useEffect(() => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
        }
    }, [messages])

    const getOtherParticipant = (conv: typeof conversations[0]) => {
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

    // Get typing users for current conversation
    const currentTypingUsers = typingUsers.filter(
        u => u.conversation_id === selectedConversation?.id && u.user_id !== currentUserId
    )

    // Empty state when not connected
    if (!isConnected && !connecting) {
        return (
            <DashboardLayout role={currentRole}>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center max-w-md">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                            <WifiOff className="w-10 h-10 text-red-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-3">Connection Lost</h2>
                        <p className="text-zinc-400 leading-relaxed mb-8">
                            Unable to connect to the chat server. Please check your connection and try again.
                        </p>
                        <Button
                            onClick={() => window.location.reload()}
                            className="bg-white text-black hover:bg-zinc-200"
                        >
                            Retry Connection
                        </Button>
                    </div>
                </div>
            </DashboardLayout>
        )
    }

    // Empty state when no conversations
    if (!loadingConversations && conversations.length === 0) {
        return (
            <DashboardLayout role={currentRole}>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center max-w-md">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                            <MessageSquare className="w-10 h-10 text-emerald-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-3">No messages yet</h2>
                        <p className="text-zinc-400 leading-relaxed mb-8">
                            Start a conversation by applying to a job or hiring a freelancer.
                            Your messages will be securely stored and appear here.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Link
                                to="/jobs"
                                className="inline-flex items-center justify-center h-11 px-6 rounded-xl bg-white text-black font-bold hover:bg-zinc-200 transition-colors"
                            >
                                <Briefcase className="w-4 h-4 mr-2" />
                                Browse Jobs
                            </Link>
                            <Link
                                to="/talent"
                                className="inline-flex items-center justify-center h-11 px-6 rounded-xl border border-white/10 text-zinc-300 hover:bg-white/[0.05] transition-all"
                            >
                                <Users className="w-4 h-4 mr-2" />
                                Find Freelancers
                            </Link>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout role={currentRole}>
            <div className="h-[calc(100vh-140px)]">
                <div className="flex h-full bg-[#0a0a0c] border border-white/5 rounded-2xl overflow-hidden">
                    {/* Conversation List */}
                    <div className="w-80 border-r border-white/[0.06] flex flex-col">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-white/[0.06]">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <MessageSquare className="w-5 h-5 text-emerald-400" />
                                    Messages
                                </h2>
                                <div className={cn(
                                    "w-2 h-2 rounded-full",
                                    isConnected ? "bg-emerald-500" : "bg-yellow-500 animate-pulse"
                                )} title={isConnected ? "Connected" : "Connecting..."} />
                            </div>
                        </div>

                        {/* Search */}
                        <div className="p-4 border-b border-white/[0.06]">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                <input
                                    type="text"
                                    placeholder="Search messages..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                />
                            </div>
                        </div>

                        {/* Conversations */}
                        <div className="flex-1 overflow-y-auto">
                            {loadingConversations ? (
                                <div className="p-2">
                                    {[...Array(5)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="p-4 flex items-start gap-3 animate-pulse"
                                            style={{ animationDelay: `${i * 0.1}s` }}
                                        >
                                            <div className="w-12 h-12 rounded-full bg-white/[0.05]" />
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="h-4 w-24 bg-white/[0.05] rounded" />
                                                    <div className="h-3 w-12 bg-white/[0.05] rounded" />
                                                </div>
                                                <div className="h-3 w-40 bg-white/[0.05] rounded" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                filteredConversations.map((conv) => {
                                    const participant = getOtherParticipant(conv)
                                    return (
                                        <button
                                            key={conv.id}
                                            onClick={() => selectConversation(conv)}
                                            className={cn(
                                                "w-full p-4 flex items-start gap-3 text-left transition-all border-b border-white/[0.03]",
                                                selectedConversation?.id === conv.id
                                                    ? "bg-emerald-500/10"
                                                    : "hover:bg-white/[0.03]"
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
                                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold">
                                                        {participant?.username?.[0]?.toUpperCase() || '?'}
                                                    </div>
                                                )}
                                                {participant?.is_online && (
                                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0a0a0c]" />
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
                                                <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-xs text-white font-bold">
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
                    <div className="flex-1 flex flex-col bg-[#070709]">
                        {selectedConversation ? (
                            <>
                                {/* Chat Header */}
                                <div className="p-4 border-b border-white/[0.06] bg-[#0a0a0c]">
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
                                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold">
                                                                {participant?.username?.[0]?.toUpperCase() || '?'}
                                                            </div>
                                                        )}
                                                        <div>
                                                            <h3 className="font-medium text-white">
                                                                {participant?.username || 'Unknown'}
                                                            </h3>
                                                            {participant?.is_online ? (
                                                                <span className="text-xs text-emerald-400">Online</span>
                                                            ) : (
                                                                <span className="text-xs text-zinc-500">Offline</span>
                                                            )}
                                                        </div>
                                                    </>
                                                )
                                            })()}
                                        </div>
                                        <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-white/[0.05]">
                                            <MoreVertical className="w-5 h-5" />
                                        </Button>
                                    </div>

                                    {/* Pinned Context */}
                                    {selectedConversation.context && (
                                        <div className="mt-3 p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl">
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
                                                            "px-2.5 py-0.5 rounded-lg text-xs font-medium capitalize border",
                                                            selectedConversation.context.status === "funded" || selectedConversation.context.status === "active"
                                                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                                : "bg-blue-500/10 text-blue-400 border-blue-500/20"
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
                                <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                                    {loadingMessages ? (
                                        <div className="space-y-4 py-4">
                                            {[...Array(4)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'} animate-pulse`}
                                                    style={{ animationDelay: `${i * 0.1}s` }}
                                                >
                                                    <div className={`max-w-[70%] p-3 rounded-2xl ${i % 2 === 0 ? 'bg-white/[0.05]' : 'bg-emerald-500/20'}`}>
                                                        <div className="h-4 w-48 bg-white/10 rounded mb-2" />
                                                        <div className="h-4 w-32 bg-white/10 rounded" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : messages.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-full text-center py-12">
                                            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
                                                <MessageSquare className="w-8 h-8 text-emerald-400" />
                                            </div>
                                            <h3 className="text-lg font-medium text-white mb-1">Start the conversation</h3>
                                            <p className="text-sm text-zinc-500 max-w-xs">
                                                Send a message to begin your collaboration.
                                            </p>
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
                                                                ? "bg-emerald-500 text-white"
                                                                : "bg-white/[0.06] text-zinc-100"
                                                        )}>
                                                            {msg.message_text && (
                                                                <p className="text-sm whitespace-pre-wrap">{msg.message_text}</p>
                                                            )}
                                                            {msg.attachments && msg.attachments.length > 0 && (
                                                                <MessageAttachments
                                                                    attachments={msg.attachments}
                                                                    isOwnMessage={isMe}
                                                                />
                                                            )}
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

                                    {/* Typing indicator */}
                                    {currentTypingUsers.length > 0 && (
                                        <div className="flex items-center gap-2 text-sm text-zinc-400">
                                            <div className="flex gap-1">
                                                <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                            </div>
                                            <span>
                                                {currentTypingUsers.map(u => u.username).join(', ')} {currentTypingUsers.length === 1 ? 'is' : 'are'} typing...
                                            </span>
                                        </div>
                                    )}

                                </div>

                                {/* Message Input */}
                                <MessageInput
                                    onSend={sendMessage}
                                    onTyping={sendTyping}
                                    disabled={!isConnected}
                                    placeholder={isConnected ? "Type a message..." : "Connecting..."}
                                />
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center">
                                <div className="text-center max-w-xs">
                                    <div className="w-20 h-20 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-center mx-auto mb-6">
                                        <MessageSquare className="w-10 h-10 text-zinc-600" />
                                    </div>
                                    <h3 className="text-lg font-medium text-white mb-2">Select a conversation</h3>
                                    <p className="text-sm text-zinc-500 leading-relaxed">
                                        Choose a conversation from the sidebar to view messages and continue collaborating.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
