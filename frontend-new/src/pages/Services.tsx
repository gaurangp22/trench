import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import {
    Loader2, Search, Package, Star, User
} from "lucide-react"
import { ServiceAPI, type Service } from "@/lib/api"

export function Services() {
    const [services, setServices] = useState<Service[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [categoryFilter, _setCategoryFilter] = useState<number | undefined>()

    useEffect(() => {
        loadServices()
    }, [searchQuery, categoryFilter])

    const loadServices = async () => {
        setLoading(true)
        try {
            const data = await ServiceAPI.search({
                q: searchQuery || undefined,
                category_id: categoryFilter,
                limit: 50
            })
            setServices(data.services || [])
        } catch (error) {
            console.error("Failed to load services:", error)
        } finally {
            setLoading(false)
        }
    }

    const getLowestPrice = (service: Service) => {
        const prices = [
            service.basic_price_sol,
            service.standard_price_sol,
            service.premium_price_sol
        ].filter(p => p != null && p > 0) as number[]
        return prices.length > 0 ? Math.min(...prices) : null
    }

    return (
        <div className="min-h-screen bg-[#0A0A0B]">
            {/* Header */}
            <div className="bg-gradient-to-b from-purple-900/20 to-transparent">
                <div className="max-w-7xl mx-auto px-6 py-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-8"
                    >
                        <h1 className="text-4xl font-bold text-white mb-3">
                            Explore Services
                        </h1>
                        <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
                            Find talented freelancers offering their skills. From design to development,
                            discover the perfect service for your project.
                        </p>
                    </motion.div>

                    {/* Search */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="max-w-2xl mx-auto"
                    >
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                            <input
                                type="text"
                                placeholder="Search services..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-14 bg-white/[0.03] border border-white/[0.08] rounded-2xl pl-12 pr-4 text-white placeholder:text-zinc-500 focus:outline-none focus:border-purple-500/50 transition-colors"
                            />
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6 pb-20">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-8 h-8 text-zinc-500 animate-spin" />
                    </div>
                ) : services.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-20"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
                            <Package className="w-8 h-8 text-zinc-500" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">
                            {searchQuery ? 'No services found' : 'No services available'}
                        </h3>
                        <p className="text-zinc-500 max-w-md mx-auto">
                            {searchQuery
                                ? 'Try a different search term or browse all services'
                                : 'Check back later for new freelancer services'}
                        </p>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {services.map((service, i) => {
                            const lowestPrice = getLowestPrice(service)
                            return (
                                <motion.div
                                    key={service.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.03 }}
                                >
                                    <Link to={`/services/${service.id}`}>
                                        <div className="group rounded-2xl bg-white/[0.02] border border-white/[0.06] overflow-hidden hover:border-purple-500/30 hover:bg-white/[0.04] transition-all">
                                            {/* Thumbnail */}
                                            <div className="aspect-[16/10] bg-gradient-to-br from-purple-500/20 to-blue-500/20 relative overflow-hidden">
                                                {service.thumbnail_url ? (
                                                    <img
                                                        src={service.thumbnail_url}
                                                        alt={service.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Package className="w-12 h-12 text-white/10" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="p-4">
                                                {/* Freelancer */}
                                                <div className="flex items-center gap-2 mb-3">
                                                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center overflow-hidden">
                                                        {service.profile?.avatar_url ? (
                                                            <img
                                                                src={service.profile.avatar_url}
                                                                alt=""
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <User className="w-3.5 h-3.5 text-zinc-400" />
                                                        )}
                                                    </div>
                                                    <span className="text-sm text-zinc-400">
                                                        {service.profile?.display_name || service.freelancer?.display_name || 'Freelancer'}
                                                    </span>
                                                </div>

                                                {/* Title */}
                                                <h3 className="font-medium text-white line-clamp-2 group-hover:text-purple-400 transition-colors mb-3 min-h-[2.5rem]">
                                                    {service.title}
                                                </h3>

                                                {/* Stats */}
                                                <div className="flex items-center gap-3 text-xs text-zinc-500 mb-3">
                                                    {service.average_rating > 0 && (
                                                        <span className="flex items-center gap-1">
                                                            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                                            {service.average_rating.toFixed(1)}
                                                            <span className="text-zinc-600">({service.total_reviews})</span>
                                                        </span>
                                                    )}
                                                    {service.orders_count > 0 && (
                                                        <span>{service.orders_count} orders</span>
                                                    )}
                                                </div>

                                                {/* Price */}
                                                <div className="pt-3 border-t border-white/[0.06]">
                                                    {lowestPrice ? (
                                                        <div className="flex items-baseline gap-1">
                                                            <span className="text-xs text-zinc-500">From</span>
                                                            <span className="font-semibold text-emerald-400">
                                                                {lowestPrice} SOL
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-zinc-500">Contact for pricing</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
