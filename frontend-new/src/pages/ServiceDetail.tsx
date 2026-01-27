import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { motion } from "framer-motion"
import {
    Loader2, ArrowLeft, Star, Clock, User,
    CheckCircle, ChevronDown, MessageSquare, ShoppingBag
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { ServiceAPI, ServiceOrderAPI, type Service, type ServiceFAQ, type ServiceReview, type PackageTier } from "@/lib/api"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/AuthContext"

interface PackageInfo {
    tier: PackageTier
    name: string
    price?: number
    description?: string
    deliveryDays?: number
    revisions?: number
}

export function ServiceDetail() {
    const { serviceId } = useParams<{ serviceId: string }>()
    const navigate = useNavigate()
    const { user } = useAuth()

    const [service, setService] = useState<Service | null>(null)
    const [faqs, setFaqs] = useState<ServiceFAQ[]>([])
    const [reviews, setReviews] = useState<ServiceReview[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedPackage, setSelectedPackage] = useState<PackageTier>('basic')
    const [requirements, setRequirements] = useState('')
    const [ordering, setOrdering] = useState(false)
    const [expandedFaq, setExpandedFaq] = useState<string | null>(null)
    const [activeImage, setActiveImage] = useState(0)

    useEffect(() => {
        if (serviceId) {
            loadService()
        }
    }, [serviceId])

    const loadService = async () => {
        if (!serviceId) return
        setLoading(true)
        try {
            const data = await ServiceAPI.getById(serviceId)
            setService(data.service)
            setFaqs(data.faqs || [])
            setReviews(data.reviews || [])

            // Select first available package
            if (data.service.basic_price_sol) setSelectedPackage('basic')
            else if (data.service.standard_price_sol) setSelectedPackage('standard')
            else if (data.service.premium_price_sol) setSelectedPackage('premium')
        } catch (error) {
            console.error("Failed to load service:", error)
        } finally {
            setLoading(false)
        }
    }

    const getPackages = (): PackageInfo[] => {
        if (!service) return []
        const packages: PackageInfo[] = [
            {
                tier: 'basic' as PackageTier,
                name: 'Basic',
                price: service.basic_price_sol,
                description: service.basic_description,
                deliveryDays: service.basic_delivery_days,
                revisions: service.basic_revisions
            },
            {
                tier: 'standard' as PackageTier,
                name: 'Standard',
                price: service.standard_price_sol,
                description: service.standard_description,
                deliveryDays: service.standard_delivery_days,
                revisions: service.standard_revisions
            },
            {
                tier: 'premium' as PackageTier,
                name: 'Premium',
                price: service.premium_price_sol,
                description: service.premium_description,
                deliveryDays: service.premium_delivery_days,
                revisions: service.premium_revisions
            }
        ]
        return packages.filter(p => p.price != null && p.price > 0)
    }

    const handleOrder = async () => {
        if (!serviceId || !user) return

        if (user.role !== 'client') {
            alert('Only clients can place orders')
            return
        }

        setOrdering(true)
        try {
            const response = await ServiceOrderAPI.placeOrder(serviceId, {
                package_tier: selectedPackage,
                requirements: requirements || undefined
            })
            navigate(`/client/orders/${response.order.id}`)
        } catch (error) {
            console.error("Failed to place order:", error)
            alert("Failed to place order. Please try again.")
        } finally {
            setOrdering(false)
        }
    }

    const packages = getPackages()
    const currentPackage = packages.find(p => p.tier === selectedPackage) || packages[0]
    const allImages = service?.thumbnail_url
        ? [service.thumbnail_url, ...(service.gallery_urls || [])]
        : service?.gallery_urls || []

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-zinc-500 animate-spin" />
            </div>
        )
    }

    if (!service) {
        return (
            <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-white mb-2">Service not found</h2>
                    <Link to="/services" className="text-purple-400 hover:underline">
                        Browse services
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#0A0A0B]">
            {/* Header */}
            <div className="border-b border-white/[0.06]">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <button
                        onClick={() => navigate('/services')}
                        className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to services
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Title & Freelancer */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <h1 className="text-3xl font-bold text-white mb-4">
                                {service.title}
                            </h1>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center overflow-hidden">
                                        {service.profile?.avatar_url ? (
                                            <img
                                                src={service.profile.avatar_url}
                                                alt=""
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <User className="w-5 h-5 text-zinc-400" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium text-white">
                                            {service.profile?.display_name || service.freelancer?.display_name}
                                        </p>
                                        {service.profile?.professional_title && (
                                            <p className="text-sm text-zinc-500">{service.profile.professional_title}</p>
                                        )}
                                    </div>
                                </div>
                                {service.average_rating > 0 && (
                                    <div className="flex items-center gap-1 text-sm">
                                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                        <span className="text-white font-medium">{service.average_rating.toFixed(1)}</span>
                                        <span className="text-zinc-500">({service.total_reviews} reviews)</span>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Gallery */}
                        {allImages.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.05 }}
                            >
                                <div className="aspect-video rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 overflow-hidden mb-3">
                                    <img
                                        src={allImages[activeImage]}
                                        alt={service.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                {allImages.length > 1 && (
                                    <div className="flex gap-2 overflow-x-auto pb-2">
                                        {allImages.map((img, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setActiveImage(i)}
                                                className={cn(
                                                    "w-20 h-14 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors",
                                                    activeImage === i
                                                        ? "border-purple-500"
                                                        : "border-transparent opacity-60 hover:opacity-100"
                                                )}
                                            >
                                                <img src={img} alt="" className="w-full h-full object-cover" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* Description */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-6"
                        >
                            <h2 className="text-lg font-semibold text-white mb-4">About This Service</h2>
                            <div className="prose prose-invert prose-sm max-w-none">
                                <p className="text-zinc-300 whitespace-pre-wrap">
                                    {service.description}
                                </p>
                            </div>
                        </motion.div>

                        {/* FAQs */}
                        {faqs.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15 }}
                                className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-6"
                            >
                                <h2 className="text-lg font-semibold text-white mb-4">FAQ</h2>
                                <div className="space-y-3">
                                    {faqs.map((faq) => (
                                        <div
                                            key={faq.id}
                                            className="border border-white/[0.06] rounded-xl overflow-hidden"
                                        >
                                            <button
                                                onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                                                className="w-full flex items-center justify-between p-4 text-left hover:bg-white/[0.02] transition-colors"
                                            >
                                                <span className="font-medium text-white">{faq.question}</span>
                                                <ChevronDown className={cn(
                                                    "w-4 h-4 text-zinc-400 transition-transform",
                                                    expandedFaq === faq.id && "rotate-180"
                                                )} />
                                            </button>
                                            {expandedFaq === faq.id && (
                                                <div className="px-4 pb-4 text-sm text-zinc-400">
                                                    {faq.answer}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Reviews */}
                        {reviews.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-6"
                            >
                                <h2 className="text-lg font-semibold text-white mb-4">
                                    Reviews ({reviews.length})
                                </h2>
                                <div className="space-y-4">
                                    {reviews.map((review) => (
                                        <div
                                            key={review.id}
                                            className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]"
                                        >
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                                                    {review.reviewer?.avatar_url ? (
                                                        <img
                                                            src={review.reviewer.avatar_url}
                                                            alt=""
                                                            className="w-full h-full rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <User className="w-4 h-4 text-zinc-400" />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium text-white text-sm">
                                                        {review.reviewer?.display_name || review.reviewer?.username}
                                                    </p>
                                                    <div className="flex items-center gap-1">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                className={cn(
                                                                    "w-3 h-3",
                                                                    i < review.rating
                                                                        ? "text-amber-400 fill-amber-400"
                                                                        : "text-zinc-600"
                                                                )}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            {review.review_text && (
                                                <p className="text-sm text-zinc-400">{review.review_text}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Sidebar - Order */}
                    <div className="lg:col-span-1">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="sticky top-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] overflow-hidden"
                        >
                            {/* Package Tabs */}
                            {packages.length > 1 && (
                                <div className="flex border-b border-white/[0.06]">
                                    {packages.map((pkg) => (
                                        <button
                                            key={pkg.tier}
                                            onClick={() => setSelectedPackage(pkg.tier)}
                                            className={cn(
                                                "flex-1 py-3 text-sm font-medium transition-colors",
                                                selectedPackage === pkg.tier
                                                    ? "text-white bg-white/[0.04] border-b-2 border-purple-500"
                                                    : "text-zinc-500 hover:text-zinc-300"
                                            )}
                                        >
                                            {pkg.name}
                                        </button>
                                    ))}
                                </div>
                            )}

                            <div className="p-5 space-y-5">
                                {/* Price */}
                                <div className="flex items-baseline justify-between">
                                    <span className="text-3xl font-bold text-white">
                                        {currentPackage?.price} SOL
                                    </span>
                                    {packages.length === 1 && (
                                        <span className="text-sm text-zinc-500 capitalize">
                                            {currentPackage?.name} Package
                                        </span>
                                    )}
                                </div>

                                {/* Description */}
                                {currentPackage?.description && (
                                    <p className="text-sm text-zinc-400">
                                        {currentPackage.description}
                                    </p>
                                )}

                                {/* Features */}
                                <div className="space-y-3 text-sm">
                                    {currentPackage?.deliveryDays && (
                                        <div className="flex items-center gap-3">
                                            <Clock className="w-4 h-4 text-zinc-500" />
                                            <span className="text-zinc-300">
                                                {currentPackage.deliveryDays} day{currentPackage.deliveryDays > 1 ? 's' : ''} delivery
                                            </span>
                                        </div>
                                    )}
                                    {currentPackage?.revisions != null && (
                                        <div className="flex items-center gap-3">
                                            <CheckCircle className="w-4 h-4 text-zinc-500" />
                                            <span className="text-zinc-300">
                                                {currentPackage.revisions} revision{currentPackage.revisions !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Requirements */}
                                {user?.role === 'client' && (
                                    <div>
                                        <label className="block text-sm text-zinc-400 mb-2">
                                            Requirements (optional)
                                        </label>
                                        <textarea
                                            value={requirements}
                                            onChange={(e) => setRequirements(e.target.value)}
                                            placeholder="Describe what you need..."
                                            rows={3}
                                            className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/20 resize-none"
                                        />
                                    </div>
                                )}

                                {/* Order Button */}
                                {user?.role === 'client' ? (
                                    <Button
                                        onClick={handleOrder}
                                        disabled={ordering}
                                        className="w-full h-12 rounded-xl bg-purple-500 text-white hover:bg-purple-600 font-medium"
                                    >
                                        {ordering ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                <ShoppingBag className="w-5 h-5 mr-2" />
                                                Order Now
                                            </>
                                        )}
                                    </Button>
                                ) : user?.role === 'freelancer' ? (
                                    <p className="text-sm text-zinc-500 text-center py-2">
                                        Switch to client mode to place orders
                                    </p>
                                ) : (
                                    <Link to="/auth/login">
                                        <Button className="w-full h-12 rounded-xl bg-purple-500 text-white hover:bg-purple-600 font-medium">
                                            Login to Order
                                        </Button>
                                    </Link>
                                )}

                                {/* Contact */}
                                <Button
                                    variant="outline"
                                    className="w-full h-10 rounded-xl border-white/10 text-zinc-300 hover:text-white hover:bg-white/5"
                                >
                                    <MessageSquare className="w-4 h-4 mr-2" />
                                    Contact Seller
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    )
}
