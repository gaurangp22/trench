import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/Button"
import { motion } from "framer-motion"
import {
    Loader2, Search, ShoppingBag, Clock, User,
    CheckCircle, Package, MessageSquare, Star
} from "lucide-react"
import { ServiceOrderAPI, type ServiceOrder } from "@/lib/api"
import { cn } from "@/lib/utils"

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    pending: { label: "Pending", color: "text-amber-400", bg: "bg-amber-500/10" },
    active: { label: "In Progress", color: "text-blue-400", bg: "bg-blue-500/10" },
    delivered: { label: "Delivered", color: "text-purple-400", bg: "bg-purple-500/10" },
    revision_requested: { label: "Revision Requested", color: "text-orange-400", bg: "bg-orange-500/10" },
    completed: { label: "Completed", color: "text-indigo-400", bg: "bg-indigo-500/10" },
    cancelled: { label: "Cancelled", color: "text-red-400", bg: "bg-red-500/10" },
    disputed: { label: "Disputed", color: "text-red-400", bg: "bg-red-500/10" },
}

type FilterType = 'all' | 'active' | 'delivered' | 'completed'

export function MyOrders() {
    const [orders, setOrders] = useState<ServiceOrder[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<FilterType>('all')
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        loadOrders()
    }, [])

    const loadOrders = async () => {
        setLoading(true)
        try {
            const data = await ServiceOrderAPI.getMyOrders('client')
            setOrders(data.orders || [])
        } catch (error) {
            console.error("Failed to load orders:", error)
        } finally {
            setLoading(false)
        }
    }

    const filteredOrders = orders
        .filter(o => {
            if (filter === 'all') return true
            if (filter === 'active') return ['pending', 'active', 'revision_requested'].includes(o.status)
            if (filter === 'delivered') return o.status === 'delivered'
            if (filter === 'completed') return ['completed', 'cancelled'].includes(o.status)
            return true
        })
        .filter(o => {
            if (!searchQuery) return true
            return o.service?.title?.toLowerCase().includes(searchQuery.toLowerCase())
        })

    const getCounts = () => ({
        all: orders.length,
        active: orders.filter(o => ['pending', 'active', 'revision_requested'].includes(o.status)).length,
        delivered: orders.filter(o => o.status === 'delivered').length,
        completed: orders.filter(o => ['completed', 'cancelled'].includes(o.status)).length,
    })

    const counts = getCounts()

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }

    return (
        <DashboardLayout role="client">
            <div className="space-y-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
                >
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-1">My Orders</h1>
                        <p className="text-zinc-400">Track your purchased services</p>
                    </div>
                    <Link to="/services">
                        <Button className="h-10 px-4 rounded-xl bg-purple-500 text-white hover:bg-purple-600">
                            <ShoppingBag className="w-4 h-4 mr-2" />
                            Browse Services
                        </Button>
                    </Link>
                </motion.div>

                {/* Filters & Search */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4"
                >
                    {/* Filter Tabs */}
                    <div className="flex items-center gap-1 p-1 bg-white/[0.02] rounded-xl border border-white/[0.06]">
                        {(['all', 'active', 'delivered', 'completed'] as FilterType[]).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize",
                                    filter === f
                                        ? "bg-white/10 text-white"
                                        : "text-zinc-500 hover:text-zinc-300"
                                )}
                            >
                                {f}
                                <span className="ml-1.5 text-xs text-zinc-600">
                                    ({counts[f]})
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                            type="text"
                            placeholder="Search orders..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full sm:w-64 h-10 bg-white/[0.02] border border-white/[0.06] rounded-xl pl-10 pr-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/20 transition-colors"
                        />
                    </div>
                </motion.div>

                {/* Orders List */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-center py-16 rounded-2xl bg-white/[0.02] border border-white/[0.06]"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
                            <ShoppingBag className="w-6 h-6 text-zinc-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">
                            {searchQuery ? 'No orders found' : filter === 'all' ? 'No orders yet' : `No ${filter} orders`}
                        </h3>
                        <p className="text-sm text-zinc-500 mb-6 max-w-sm mx-auto">
                            {searchQuery
                                ? 'Try a different search term'
                                : 'Browse freelancer services and place your first order'}
                        </p>
                        {!searchQuery && filter === 'all' && (
                            <Link to="/services">
                                <Button className="h-10 px-6 rounded-xl bg-purple-500 text-white hover:bg-purple-600">
                                    Browse Services
                                </Button>
                            </Link>
                        )}
                    </motion.div>
                ) : (
                    <div className="space-y-3">
                        {filteredOrders.map((order, i) => {
                            const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
                            const isDelivered = order.status === 'delivered'
                            const isCompleted = order.status === 'completed'

                            return (
                                <motion.div
                                    key={order.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 + i * 0.03 }}
                                    className={cn(
                                        "group rounded-2xl bg-white/[0.02] border hover:bg-white/[0.04] transition-all",
                                        isDelivered
                                            ? "border-purple-500/30"
                                            : "border-white/[0.06] hover:border-white/[0.1]"
                                    )}
                                >
                                    <div className="p-5">
                                        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                            {/* Service Thumbnail */}
                                            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex-shrink-0 overflow-hidden">
                                                {order.service?.thumbnail_url ? (
                                                    <img
                                                        src={order.service.thumbnail_url}
                                                        alt={order.service.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Package className="w-6 h-6 text-white/20" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Order Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className={cn(
                                                        "px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider",
                                                        statusConfig.bg,
                                                        statusConfig.color
                                                    )}>
                                                        {statusConfig.label}
                                                    </span>
                                                    <span className="text-xs text-zinc-500 capitalize">
                                                        {order.package_tier} package
                                                    </span>
                                                </div>
                                                <h3 className="font-semibold text-white truncate group-hover:text-purple-400 transition-colors mb-2">
                                                    {order.service?.title || 'Service Order'}
                                                </h3>
                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-zinc-500">
                                                    <span className="flex items-center gap-1.5">
                                                        <User className="w-3.5 h-3.5" />
                                                        {order.freelancer?.display_name || order.freelancer?.username || 'Freelancer'}
                                                    </span>
                                                    <span className="text-indigo-400 font-medium">{order.price_sol} SOL</span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {formatDate(order.created_at)}
                                                    </span>
                                                    {order.expected_delivery_at && (
                                                        <span className="text-amber-400">
                                                            Due: {formatDate(order.expected_delivery_at)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2 pt-4 lg:pt-0 border-t lg:border-0 border-white/[0.06]">
                                                {isDelivered && (
                                                    <Link to={`/client/orders/${order.id}`}>
                                                        <Button className="h-9 px-4 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 text-sm">
                                                            <CheckCircle className="w-4 h-4 mr-2" />
                                                            Review Delivery
                                                        </Button>
                                                    </Link>
                                                )}
                                                {isCompleted && !order.completed_at && (
                                                    <Link to={`/client/orders/${order.id}`}>
                                                        <Button className="h-9 px-4 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 text-sm">
                                                            <Star className="w-4 h-4 mr-2" />
                                                            Leave Review
                                                        </Button>
                                                    </Link>
                                                )}
                                                <Link to={`/client/orders/${order.id}`}>
                                                    <Button
                                                        variant="outline"
                                                        className="h-9 px-4 rounded-lg border-white/10 text-zinc-300 hover:text-white hover:bg-white/5 text-sm"
                                                    >
                                                        <MessageSquare className="w-4 h-4 mr-2" />
                                                        Details
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}
