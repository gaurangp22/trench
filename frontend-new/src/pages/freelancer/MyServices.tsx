import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/Button"
import { motion } from "framer-motion"
import {
    Loader2, Search, Plus, Package, Eye, Edit,
    Pause, Play, Trash2, Star, ShoppingCart
} from "lucide-react"
import { ServiceAPI, type Service } from "@/lib/api"
import { cn } from "@/lib/utils"

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    draft: { label: "Draft", color: "text-zinc-400", bg: "bg-zinc-500/10" },
    active: { label: "Active", color: "text-indigo-400", bg: "bg-indigo-500/10" },
    paused: { label: "Paused", color: "text-amber-400", bg: "bg-amber-500/10" },
    archived: { label: "Archived", color: "text-red-400", bg: "bg-red-500/10" },
}

type FilterType = 'all' | 'active' | 'draft' | 'paused'

export function MyServices() {
    const [services, setServices] = useState<Service[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<FilterType>('all')
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        loadServices()
    }, [])

    const loadServices = async () => {
        setLoading(true)
        try {
            const data = await ServiceAPI.getMyServices()
            setServices(data.services || [])
        } catch (error) {
            console.error("Failed to load services:", error)
        } finally {
            setLoading(false)
        }
    }

    const filteredServices = services
        .filter(s => {
            if (filter === 'all') return s.status !== 'archived'
            return s.status === filter
        })
        .filter(s => {
            if (!searchQuery) return true
            return s.title.toLowerCase().includes(searchQuery.toLowerCase())
        })

    const getCounts = () => ({
        all: services.filter(s => s.status !== 'archived').length,
        active: services.filter(s => s.status === 'active').length,
        draft: services.filter(s => s.status === 'draft').length,
        paused: services.filter(s => s.status === 'paused').length,
    })

    const counts = getCounts()

    const handlePublish = async (serviceId: string) => {
        try {
            await ServiceAPI.publish(serviceId)
            setServices(prev => prev.map(s =>
                s.id === serviceId ? { ...s, status: 'active' as const } : s
            ))
        } catch (error) {
            console.error("Failed to publish:", error)
            alert("Failed to publish service")
        }
    }

    const handlePause = async (serviceId: string) => {
        try {
            await ServiceAPI.pause(serviceId)
            setServices(prev => prev.map(s =>
                s.id === serviceId ? { ...s, status: 'paused' as const } : s
            ))
        } catch (error) {
            console.error("Failed to pause:", error)
            alert("Failed to pause service")
        }
    }

    const handleDelete = async (serviceId: string) => {
        if (!confirm("Are you sure you want to archive this service?")) return
        try {
            await ServiceAPI.delete(serviceId)
            setServices(prev => prev.map(s =>
                s.id === serviceId ? { ...s, status: 'archived' as const } : s
            ))
        } catch (error) {
            console.error("Failed to delete:", error)
            alert("Failed to archive service")
        }
    }

    const getLowestPrice = (service: Service) => {
        const prices = [
            service.basic_price_sol,
            service.standard_price_sol,
            service.premium_price_sol
        ].filter(p => p !== undefined && p !== null) as number[]
        return prices.length > 0 ? Math.min(...prices) : 0
    }

    return (
        <DashboardLayout role="freelancer">
            <div className="space-y-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
                >
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-1">My Services</h1>
                        <p className="text-zinc-400">Create and manage your service offerings</p>
                    </div>
                    <Link to="/freelancer/services/create">
                        <Button className="h-11 px-5 rounded-xl bg-white text-black hover:bg-zinc-100 font-semibold">
                            <Plus className="w-4 h-4 mr-2" />
                            Create Service
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
                        {(['all', 'active', 'draft', 'paused'] as FilterType[]).map((f) => (
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
                            placeholder="Search services..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full sm:w-64 h-10 bg-white/[0.02] border border-white/[0.06] rounded-xl pl-10 pr-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/20 transition-colors"
                        />
                    </div>
                </motion.div>

                {/* Services Grid */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
                    </div>
                ) : filteredServices.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-center py-16 rounded-2xl bg-white/[0.02] border border-white/[0.06]"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
                            <Package className="w-6 h-6 text-zinc-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">
                            {searchQuery ? 'No services found' : filter === 'all' ? 'No services yet' : `No ${filter} services`}
                        </h3>
                        <p className="text-sm text-zinc-500 mb-6 max-w-sm mx-auto">
                            {searchQuery
                                ? 'Try a different search term'
                                : filter === 'all'
                                ? 'Create your first service and start earning'
                                : `You don't have any ${filter} services at the moment`}
                        </p>
                        {filter === 'all' && !searchQuery && (
                            <Link to="/freelancer/services/create">
                                <Button className="h-10 px-5 rounded-xl bg-white text-black hover:bg-zinc-100 font-semibold">
                                    Create Service
                                </Button>
                            </Link>
                        )}
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredServices.map((service, i) => {
                            const statusConfig = STATUS_CONFIG[service.status] || STATUS_CONFIG.draft
                            const lowestPrice = getLowestPrice(service)

                            return (
                                <motion.div
                                    key={service.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 + i * 0.03 }}
                                    className="group rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all overflow-hidden"
                                >
                                    {/* Thumbnail */}
                                    <div className="aspect-video bg-gradient-to-br from-purple-500/20 to-blue-500/20 relative">
                                        {service.thumbnail_url ? (
                                            <img
                                                src={service.thumbnail_url}
                                                alt={service.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <Package className="w-10 h-10 text-white/20" />
                                            </div>
                                        )}
                                        <div className="absolute top-3 left-3">
                                            <span className={cn(
                                                "px-2 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider",
                                                statusConfig.bg,
                                                statusConfig.color
                                            )}>
                                                {statusConfig.label}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-4">
                                        <h3 className="font-semibold text-white truncate group-hover:text-purple-400 transition-colors mb-2">
                                            {service.title}
                                        </h3>

                                        {/* Stats */}
                                        <div className="flex items-center gap-4 text-sm text-zinc-500 mb-4">
                                            <span className="flex items-center gap-1">
                                                <Eye className="w-3.5 h-3.5" />
                                                {service.views_count}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <ShoppingCart className="w-3.5 h-3.5" />
                                                {service.orders_count}
                                            </span>
                                            {service.average_rating > 0 && (
                                                <span className="flex items-center gap-1 text-amber-400">
                                                    <Star className="w-3.5 h-3.5 fill-current" />
                                                    {service.average_rating.toFixed(1)}
                                                </span>
                                            )}
                                        </div>

                                        {/* Price */}
                                        <div className="text-indigo-400 font-semibold mb-4">
                                            Starting at {lowestPrice} SOL
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2">
                                            <Link to={`/freelancer/services/${service.id}`} className="flex-1">
                                                <Button
                                                    variant="outline"
                                                    className="w-full h-9 rounded-lg border-white/10 text-zinc-300 hover:text-white hover:bg-white/5 text-sm"
                                                >
                                                    <Edit className="w-4 h-4 mr-1" />
                                                    Edit
                                                </Button>
                                            </Link>
                                            {service.status === 'draft' && (
                                                <Button
                                                    onClick={() => handlePublish(service.id)}
                                                    className="h-9 px-3 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 text-sm"
                                                >
                                                    <Play className="w-4 h-4" />
                                                </Button>
                                            )}
                                            {service.status === 'active' && (
                                                <Button
                                                    onClick={() => handlePause(service.id)}
                                                    className="h-9 px-3 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 text-sm"
                                                >
                                                    <Pause className="w-4 h-4" />
                                                </Button>
                                            )}
                                            {service.status === 'paused' && (
                                                <Button
                                                    onClick={() => handlePublish(service.id)}
                                                    className="h-9 px-3 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 text-sm"
                                                >
                                                    <Play className="w-4 h-4" />
                                                </Button>
                                            )}
                                            <Button
                                                onClick={() => handleDelete(service.id)}
                                                variant="ghost"
                                                className="h-9 px-3 rounded-lg text-red-400/70 hover:text-red-400 hover:bg-red-500/10 text-sm"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
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
