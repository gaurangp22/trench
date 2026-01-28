import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/Button"
import { motion } from "framer-motion"
import {
    Loader2, ArrowLeft, User, Package, Send,
    CheckCircle, AlertTriangle, MessageSquare, Upload
} from "lucide-react"
import { ServiceOrderAPI, type ServiceOrder, type ServiceOrderMessage } from "@/lib/api"
import { cn } from "@/lib/utils"

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    pending: { label: "Pending Acceptance", color: "text-amber-400", bg: "bg-amber-500/10" },
    active: { label: "In Progress", color: "text-blue-400", bg: "bg-blue-500/10" },
    delivered: { label: "Delivered", color: "text-purple-400", bg: "bg-purple-500/10" },
    revision_requested: { label: "Revision Requested", color: "text-orange-400", bg: "bg-orange-500/10" },
    completed: { label: "Completed", color: "text-indigo-400", bg: "bg-indigo-500/10" },
    cancelled: { label: "Cancelled", color: "text-red-400", bg: "bg-red-500/10" },
    disputed: { label: "Disputed", color: "text-red-400", bg: "bg-red-500/10" },
}

export function OrderDetail() {
    const { orderId } = useParams<{ orderId: string }>()
    const navigate = useNavigate()
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const [order, setOrder] = useState<ServiceOrder | null>(null)
    const [messages, setMessages] = useState<ServiceOrderMessage[]>([])
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const [delivering, setDelivering] = useState(false)
    const [messageText, setMessageText] = useState("")
    const [deliveryMessage, setDeliveryMessage] = useState("")
    const [showDeliveryForm, setShowDeliveryForm] = useState(false)

    useEffect(() => {
        if (orderId) {
            loadOrder()
            loadMessages()
        }
    }, [orderId])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    const loadOrder = async () => {
        if (!orderId) return
        try {
            const data = await ServiceOrderAPI.getById(orderId)
            setOrder(data.order)
        } catch (error) {
            console.error("Failed to load order:", error)
        } finally {
            setLoading(false)
        }
    }

    const loadMessages = async () => {
        if (!orderId) return
        try {
            const data = await ServiceOrderAPI.getMessages(orderId)
            setMessages(data.messages || [])
        } catch (error) {
            console.error("Failed to load messages:", error)
        }
    }

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!orderId || !messageText.trim()) return

        setSending(true)
        try {
            await ServiceOrderAPI.sendMessage(orderId, { message: messageText })
            setMessageText("")
            loadMessages()
        } catch (error) {
            console.error("Failed to send message:", error)
            alert("Failed to send message")
        } finally {
            setSending(false)
        }
    }

    const handleDeliver = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!orderId || !deliveryMessage.trim()) return

        setDelivering(true)
        try {
            await ServiceOrderAPI.deliver(orderId, { message: deliveryMessage })
            setDeliveryMessage("")
            setShowDeliveryForm(false)
            loadOrder()
            loadMessages()
        } catch (error) {
            console.error("Failed to deliver order:", error)
            alert("Failed to deliver order")
        } finally {
            setDelivering(false)
        }
    }

    const handleAccept = async () => {
        if (!orderId) return
        try {
            await ServiceOrderAPI.accept(orderId)
            loadOrder()
        } catch (error) {
            console.error("Failed to accept order:", error)
            alert("Failed to accept order")
        }
    }

    const handleCancel = async () => {
        if (!orderId || !confirm("Are you sure you want to cancel this order?")) return
        try {
            await ServiceOrderAPI.cancel(orderId)
            loadOrder()
        } catch (error) {
            console.error("Failed to cancel order:", error)
            alert("Failed to cancel order")
        }
    }

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const formatShortDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        })
    }

    if (loading) {
        return (
            <DashboardLayout role="freelancer">
                <div className="flex justify-center py-20">
                    <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
                </div>
            </DashboardLayout>
        )
    }

    if (!order) {
        return (
            <DashboardLayout role="freelancer">
                <div className="text-center py-20">
                    <h2 className="text-xl font-semibold text-white mb-2">Order not found</h2>
                    <Link to="/freelancer/orders" className="text-purple-400 hover:underline">
                        Back to orders
                    </Link>
                </div>
            </DashboardLayout>
        )
    }

    const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
    const isPending = order.status === 'pending'
    const isActive = order.status === 'active'
    const isRevisionRequested = order.status === 'revision_requested'
    const canDeliver = isActive || isRevisionRequested
    const isCompleted = order.status === 'completed'
    const isCancelled = order.status === 'cancelled'

    return (
        <DashboardLayout role="freelancer">
            <div className="space-y-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-4"
                >
                    <button
                        onClick={() => navigate('/freelancer/orders')}
                        className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-zinc-400" />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-white">
                            {order.service?.title || 'Service Order'}
                        </h1>
                        <p className="text-zinc-400 text-sm">Order #{order.id.slice(0, 8)}</p>
                    </div>
                    <span className={cn(
                        "px-3 py-1 rounded-lg text-sm font-medium",
                        statusConfig.bg,
                        statusConfig.color
                    )}>
                        {statusConfig.label}
                    </span>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content - Messages */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        className="lg:col-span-2 space-y-4"
                    >
                        {/* Revision Alert */}
                        {isRevisionRequested && (
                            <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="font-medium text-orange-400">Revision Requested</h3>
                                    <p className="text-sm text-zinc-400 mt-1">
                                        The client has requested changes. Please review their feedback and submit a new delivery.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Messages */}
                        <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] overflow-hidden">
                            <div className="p-4 border-b border-white/[0.06]">
                                <h2 className="font-semibold text-white flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4" />
                                    Order Activity
                                </h2>
                            </div>
                            <div className="h-[400px] overflow-y-auto p-4 space-y-4">
                                {messages.length === 0 ? (
                                    <div className="text-center py-8 text-zinc-500">
                                        No messages yet. Start the conversation!
                                    </div>
                                ) : (
                                    messages.map((msg) => {
                                        const isSystem = msg.message_type === 'system'
                                        const isDelivery = msg.message_type === 'delivery'
                                        const isOwnMessage = msg.sender_id === order.freelancer_id

                                        if (isSystem) {
                                            return (
                                                <div key={msg.id} className="text-center">
                                                    <span className="text-xs text-zinc-500 bg-white/[0.02] px-3 py-1 rounded-full">
                                                        {msg.message_text}
                                                    </span>
                                                </div>
                                            )
                                        }

                                        return (
                                            <div
                                                key={msg.id}
                                                className={cn(
                                                    "flex gap-3",
                                                    isOwnMessage ? "flex-row-reverse" : ""
                                                )}
                                            >
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0">
                                                    {msg.sender?.avatar_url ? (
                                                        <img
                                                            src={msg.sender.avatar_url}
                                                            alt=""
                                                            className="w-full h-full rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <User className="w-4 h-4 text-zinc-400" />
                                                    )}
                                                </div>
                                                <div className={cn(
                                                    "max-w-[70%] rounded-2xl p-3",
                                                    isDelivery
                                                        ? "bg-indigo-500/10 border border-indigo-500/30"
                                                        : isOwnMessage
                                                            ? "bg-purple-500/10"
                                                            : "bg-white/[0.04]"
                                                )}>
                                                    {isDelivery && (
                                                        <div className="flex items-center gap-2 text-indigo-400 text-xs font-medium mb-2">
                                                            <Package className="w-3 h-3" />
                                                            Delivery
                                                        </div>
                                                    )}
                                                    <p className="text-sm text-zinc-200 whitespace-pre-wrap">
                                                        {msg.message_text}
                                                    </p>
                                                    <p className="text-[10px] text-zinc-500 mt-1">
                                                        {formatDate(msg.created_at)}
                                                    </p>
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Message Input */}
                            {!isCompleted && !isCancelled && (
                                <form onSubmit={handleSendMessage} className="p-4 border-t border-white/[0.06]">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={messageText}
                                            onChange={(e) => setMessageText(e.target.value)}
                                            placeholder="Type a message..."
                                            className="flex-1 h-10 bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/20"
                                        />
                                        <Button
                                            type="submit"
                                            disabled={sending || !messageText.trim()}
                                            className="h-10 px-4 rounded-xl bg-purple-500/10 text-purple-400 hover:bg-purple-500/20"
                                        >
                                            {sending ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Send className="w-4 h-4" />
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            )}
                        </div>

                        {/* Delivery Form */}
                        {canDeliver && showDeliveryForm && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="rounded-2xl bg-white/[0.02] border border-indigo-500/30 p-5"
                            >
                                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                                    <Upload className="w-4 h-4 text-indigo-400" />
                                    Submit Delivery
                                </h3>
                                <form onSubmit={handleDeliver} className="space-y-4">
                                    <div>
                                        <label className="block text-sm text-zinc-400 mb-2">
                                            Delivery Message
                                        </label>
                                        <textarea
                                            value={deliveryMessage}
                                            onChange={(e) => setDeliveryMessage(e.target.value)}
                                            placeholder="Describe what you're delivering and include any relevant links or files..."
                                            rows={4}
                                            className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/20 resize-none"
                                        />
                                    </div>
                                    <div className="flex gap-3">
                                        <Button
                                            type="submit"
                                            disabled={delivering || !deliveryMessage.trim()}
                                            className="h-10 px-6 rounded-xl bg-indigo-500 text-white hover:bg-indigo-600"
                                        >
                                            {delivering ? (
                                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                            ) : (
                                                <CheckCircle className="w-4 h-4 mr-2" />
                                            )}
                                            Submit Delivery
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={() => setShowDeliveryForm(false)}
                                            className="h-10 px-4 rounded-xl text-zinc-400 hover:text-white"
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </form>
                            </motion.div>
                        )}
                    </motion.div>

                    {/* Sidebar */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="space-y-4"
                    >
                        {/* Order Info */}
                        <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-5">
                            <h3 className="font-semibold text-white mb-4">Order Details</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-zinc-500">Package</span>
                                    <span className="text-white capitalize">{order.package_tier}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-500">Price</span>
                                    <span className="text-indigo-400 font-medium">{order.price_sol} SOL</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-500">Delivery</span>
                                    <span className="text-white">{order.delivery_days} days</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-500">Revisions</span>
                                    <span className="text-white">{order.revisions_used} / {order.revisions_allowed}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-500">Ordered</span>
                                    <span className="text-white">{formatShortDate(order.created_at)}</span>
                                </div>
                                {order.expected_delivery_at && (
                                    <div className="flex justify-between">
                                        <span className="text-zinc-500">Due</span>
                                        <span className="text-amber-400">{formatShortDate(order.expected_delivery_at)}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Client Info */}
                        <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-5">
                            <h3 className="font-semibold text-white mb-4">Client</h3>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                                    {order.client?.avatar_url ? (
                                        <img
                                            src={order.client.avatar_url}
                                            alt=""
                                            className="w-full h-full rounded-full object-cover"
                                        />
                                    ) : (
                                        <User className="w-5 h-5 text-zinc-400" />
                                    )}
                                </div>
                                <div>
                                    <p className="font-medium text-white">
                                        {order.client?.display_name || order.client?.username || 'Client'}
                                    </p>
                                    <p className="text-xs text-zinc-500">@{order.client?.username}</p>
                                </div>
                            </div>
                        </div>

                        {/* Requirements */}
                        {order.requirements && (
                            <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-5">
                                <h3 className="font-semibold text-white mb-3">Requirements</h3>
                                <p className="text-sm text-zinc-400 whitespace-pre-wrap">
                                    {order.requirements}
                                </p>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-5 space-y-3">
                            {isPending && (
                                <>
                                    <Button
                                        onClick={handleAccept}
                                        className="w-full h-10 rounded-xl bg-indigo-500 text-white hover:bg-indigo-600"
                                    >
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Accept Order
                                    </Button>
                                    <Button
                                        onClick={handleCancel}
                                        variant="ghost"
                                        className="w-full h-10 rounded-xl text-red-400 hover:bg-red-500/10"
                                    >
                                        Decline Order
                                    </Button>
                                </>
                            )}
                            {canDeliver && !showDeliveryForm && (
                                <Button
                                    onClick={() => setShowDeliveryForm(true)}
                                    className="w-full h-10 rounded-xl bg-indigo-500 text-white hover:bg-indigo-600"
                                >
                                    <Upload className="w-4 h-4 mr-2" />
                                    {isRevisionRequested ? 'Submit Revision' : 'Deliver Order'}
                                </Button>
                            )}
                            {isCompleted && (
                                <div className="text-center py-2">
                                    <CheckCircle className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                                    <p className="text-sm text-zinc-400">Order completed successfully!</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </DashboardLayout>
    )
}
