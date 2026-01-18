import { useState } from "react"
import { Search, Shield, Send, Paperclip, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Mock data
const CONVERSATIONS = [
    {
        id: 1,
        name: "DeFi Protocol X",
        avatar: "D",
        lastMessage: "Great progress on the API integration! Let me know when you're ready for review.",
        time: "2h ago",
        unread: 2,
        online: true,
        escrowContext: {
            jobTitle: "Solana API Integration",
            amount: 150,
            status: "in_progress"
        }
    },
    {
        id: 2,
        name: "Security DAO",
        avatar: "S",
        lastMessage: "The audit scope looks good. When can you start?",
        time: "5h ago",
        unread: 0,
        online: false,
        escrowContext: {
            jobTitle: "Smart Contract Audit",
            amount: 120,
            status: "funded"
        }
    },
    {
        id: 3,
        name: "NFT Collective",
        avatar: "N",
        lastMessage: "Thanks for the proposal! We'd like to discuss the timeline.",
        time: "1d ago",
        unread: 1,
        online: false,
        escrowContext: null
    }
]

const MESSAGES = [
    { id: 1, sender: "them", text: "Hey! Thanks for submitting your proposal for the Solana API Integration project.", time: "Yesterday, 2:30 PM" },
    { id: 2, sender: "them", text: "I've reviewed your portfolio and I think you'd be a great fit.", time: "Yesterday, 2:31 PM" },
    { id: 3, sender: "me", text: "Thank you! I'm very excited about this project. The scope aligns perfectly with my experience.", time: "Yesterday, 3:15 PM" },
    { id: 4, sender: "me", text: "I have a few questions about the API requirements - specifically around rate limiting and authentication.", time: "Yesterday, 3:16 PM" },
    { id: 5, sender: "them", text: "Good questions! We're using JWT for auth and have a 100 req/min limit. I've funded the escrow - you can see the 150 SOL is now secured.", time: "Yesterday, 4:00 PM" },
    { id: 6, sender: "me", text: "Perfect, I can see the escrow is funded. I'll start with the first milestone - setting up the project structure.", time: "Yesterday, 4:30 PM" },
    { id: 7, sender: "them", text: "Great progress on the API integration! Let me know when you're ready for review.", time: "2 hours ago" },
]

export function Messages() {
    const [selectedConversation, setSelectedConversation] = useState(CONVERSATIONS[0])
    const [newMessage, setNewMessage] = useState("")

    const handleSend = () => {
        if (!newMessage.trim()) return
        console.log("Sending:", newMessage)
        setNewMessage("")
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
                                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                />
                            </div>
                        </div>

                        {/* Conversations */}
                        <div className="flex-1 overflow-y-auto">
                            {CONVERSATIONS.map((conv) => (
                                <button
                                    key={conv.id}
                                    onClick={() => setSelectedConversation(conv)}
                                    className={cn(
                                        "w-full p-4 flex items-start gap-3 text-left transition-colors",
                                        selectedConversation.id === conv.id
                                            ? "bg-zinc-800/50"
                                            : "hover:bg-zinc-800/30"
                                    )}
                                >
                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                                            {conv.avatar}
                                        </div>
                                        {conv.online && (
                                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-zinc-900" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-medium text-white truncate">{conv.name}</span>
                                            <span className="text-xs text-zinc-500">{conv.time}</span>
                                        </div>
                                        <p className="text-sm text-zinc-400 truncate">{conv.lastMessage}</p>
                                        {conv.escrowContext && (
                                            <div className="flex items-center gap-1 mt-1.5 text-xs text-emerald-400">
                                                <Shield className="w-3 h-3" />
                                                <span>◎ {conv.escrowContext.amount} in escrow</span>
                                            </div>
                                        )}
                                    </div>
                                    {conv.unread > 0 && (
                                        <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center text-xs text-white">
                                            {conv.unread}
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 flex flex-col">
                        {/* Chat Header - Escrow Context */}
                        <div className="p-4 border-b border-zinc-800">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                                        {selectedConversation.avatar}
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-white">{selectedConversation.name}</h3>
                                        {selectedConversation.online && (
                                            <span className="text-xs text-green-400">Online</span>
                                        )}
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" className="text-zinc-400">
                                    <MoreVertical className="w-5 h-5" />
                                </Button>
                            </div>

                            {/* Pinned Escrow Context */}
                            {selectedConversation.escrowContext && (
                                <div className="mt-3 p-3 bg-zinc-800/50 border border-zinc-700 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Shield className="w-4 h-4 text-emerald-400" />
                                            <span className="text-sm text-white">{selectedConversation.escrowContext.jobTitle}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-medium text-white">
                                                ◎ {selectedConversation.escrowContext.amount} SOL
                                            </span>
                                            <span className={cn(
                                                "px-2 py-0.5 rounded text-xs",
                                                selectedConversation.escrowContext.status === "funded"
                                                    ? "bg-emerald-500/10 text-emerald-400"
                                                    : "bg-blue-500/10 text-blue-400"
                                            )}>
                                                {selectedConversation.escrowContext.status === "funded" ? "Funded" : "In Progress"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {MESSAGES.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={cn(
                                        "flex",
                                        msg.sender === "me" ? "justify-end" : "justify-start"
                                    )}
                                >
                                    <div className={cn(
                                        "max-w-[70%] p-3 rounded-2xl",
                                        msg.sender === "me"
                                            ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                                            : "bg-zinc-800 text-zinc-100"
                                    )}>
                                        <p className="text-sm">{msg.text}</p>
                                        <span className={cn(
                                            "text-xs mt-1 block",
                                            msg.sender === "me" ? "text-white/70" : "text-zinc-500"
                                        )}>
                                            {msg.time}
                                        </span>
                                    </div>
                                </div>
                            ))}
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
                                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                    placeholder="Type a message..."
                                    className="flex-1 px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                />
                                <Button
                                    onClick={handleSend}
                                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                                >
                                    <Send className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
