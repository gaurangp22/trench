import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { motion, useInView } from "framer-motion"
import { ArrowRight, Star, Sparkles } from "lucide-react"
import { ServiceAPI, type Service } from "@/lib/api"
import { cn } from "@/lib/utils"
import { GradientSlideButton } from "./GradientSlideButton"

// Extended service type for featured gigs
interface FeaturedService {
    id: string
    title: string
    thumbnail_url?: string
    category?: { id: number; name: string; slug: string }
    basic_price_sol?: number
    average_rating?: number
    total_reviews?: number
    profile?: { display_name: string; avatar_url?: string }
}

// Featured categories with curated gigs
const FEATURED_SECTIONS = [
    {
        id: "artists",
        title: "Artists & Illustrators",
        subtitle: "Hand-crafted digital art & NFT collections",
        slug: "art-illustration",
        gradient: "from-rose-500/20 via-orange-500/10 to-transparent",
        accentColor: "rose"
    },
    {
        id: "developers",
        title: "Web3 Developers",
        subtitle: "Smart contracts, dApps & blockchain solutions",
        slug: "blockchain-web3",
        gradient: "from-indigo-500/20 via-violet-500/10 to-transparent",
        accentColor: "indigo"
    },
    {
        id: "designers",
        title: "UI/UX Designers",
        subtitle: "Landing pages, brand identity & visual design",
        slug: "design-branding",
        gradient: "from-emerald-500/20 via-teal-500/10 to-transparent",
        accentColor: "emerald"
    },
]

// Curated mock data - uses same IDs as Services.tsx MOCK_SERVICES for consistency
const MOCK_FEATURED: Record<string, FeaturedService[]> = {
    "artists": [
        {
            id: "4", // NFT artwork from MOCK_SERVICES
            title: "I will create custom NFT artwork and generative collections",
            thumbnail_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80",
            category: { id: 4, name: "Art & Illustration", slug: "art-illustration" },
            basic_price_sol: 0.8,
            average_rating: 4.8,
            total_reviews: 312,
            profile: { display_name: "Luna Arts", avatar_url: "https://i.pravatar.cc/150?u=luna" },
        },
        {
            id: "13", // Anime illustration from MOCK_SERVICES
            title: "I will draw anime/manga style character illustrations",
            thumbnail_url: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&q=80",
            category: { id: 13, name: "Art & Illustration", slug: "art-illustration" },
            basic_price_sol: 0.5,
            average_rating: 4.9,
            total_reviews: 234,
            profile: { display_name: "Anime Studio", avatar_url: "https://i.pravatar.cc/150?u=animestudio" },
        },
        {
            id: "11", // Motion graphics from MOCK_SERVICES
            title: "I will create animated explainer videos for your project",
            thumbnail_url: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&q=80",
            category: { id: 11, name: "3D & Motion", slug: "3d-motion" },
            basic_price_sol: 2,
            average_rating: 4.9,
            total_reviews: 67,
            profile: { display_name: "Motion Studio", avatar_url: "https://i.pravatar.cc/150?u=motionstudio" },
        },
        {
            id: "14", // 3D renders from MOCK_SERVICES
            title: "I will create stunning 3D product renders for your NFTs",
            thumbnail_url: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&q=80",
            category: { id: 14, name: "3D & Motion", slug: "3d-motion" },
            basic_price_sol: 1,
            average_rating: 4.8,
            total_reviews: 89,
            profile: { display_name: "3D Viz Pro", avatar_url: "https://i.pravatar.cc/150?u=3dvizpro" },
        },
    ],
    "developers": [
        {
            id: "1", // Solana dApp from MOCK_SERVICES
            title: "I will build a professional Solana dApp with React & Anchor",
            thumbnail_url: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=600&q=80",
            category: { id: 1, name: "Blockchain & Web3", slug: "blockchain-web3" },
            basic_price_sol: 2.5,
            average_rating: 4.9,
            total_reviews: 47,
            profile: { display_name: "Alex Chen", avatar_url: "https://i.pravatar.cc/150?u=alex" },
        },
        {
            id: "10", // NFT marketplace from MOCK_SERVICES
            title: "I will build a complete NFT marketplace on Solana",
            thumbnail_url: "https://images.unsplash.com/photo-1642104704074-907c0698b98d?w=600&q=80",
            category: { id: 10, name: "Blockchain & Web3", slug: "blockchain-web3" },
            basic_price_sol: 10,
            average_rating: 5.0,
            total_reviews: 12,
            profile: { display_name: "NFT Labs", avatar_url: "https://i.pravatar.cc/150?u=nftlabs" },
        },
        {
            id: "3", // Smart contract audit from MOCK_SERVICES
            title: "I will audit your Solana smart contract for security vulnerabilities",
            thumbnail_url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&q=80",
            category: { id: 3, name: "Tokenomics & Consulting", slug: "tokenomics-consulting" },
            basic_price_sol: 8,
            average_rating: 5.0,
            total_reviews: 23,
            profile: { display_name: "Marcus Black", avatar_url: "https://i.pravatar.cc/150?u=marcus" },
        },
        {
            id: "12", // Solana Pay from MOCK_SERVICES
            title: "I will integrate Solana Pay into your e-commerce store",
            thumbnail_url: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80",
            category: { id: 12, name: "Blockchain & Web3", slug: "blockchain-web3" },
            basic_price_sol: 1.5,
            average_rating: 4.7,
            total_reviews: 45,
            profile: { display_name: "Pay Dev", avatar_url: "https://i.pravatar.cc/150?u=paydev" },
        },
    ],
    "designers": [
        {
            id: "2", // Web3 landing page from MOCK_SERVICES
            title: "I will design a stunning Web3 landing page in Figma",
            thumbnail_url: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&q=80",
            category: { id: 2, name: "Design & Branding", slug: "design-branding" },
            basic_price_sol: 1.5,
            average_rating: 5.0,
            total_reviews: 128,
            profile: { display_name: "Sarah Kim", avatar_url: "https://i.pravatar.cc/150?u=sarah" },
        },
        {
            id: "8", // Logo design from MOCK_SERVICES
            title: "I will create a professional logo and brand identity",
            thumbnail_url: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=600&q=80",
            category: { id: 8, name: "Design & Branding", slug: "design-branding" },
            basic_price_sol: 0.6,
            average_rating: 4.9,
            total_reviews: 267,
            profile: { display_name: "Brand Studio", avatar_url: "https://i.pravatar.cc/150?u=brandstudio" },
        },
        {
            id: "5", // React frontend from MOCK_SERVICES
            title: "I will build a responsive React frontend with TailwindCSS",
            thumbnail_url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&q=80",
            category: { id: 5, name: "Web & App Development", slug: "web-app-dev" },
            basic_price_sol: 1.2,
            average_rating: 4.9,
            total_reviews: 89,
            profile: { display_name: "Dev Master", avatar_url: "https://i.pravatar.cc/150?u=devmaster" },
        },
        {
            id: "7", // Telegram bot from MOCK_SERVICES
            title: "I will develop a Telegram trading bot for Solana tokens",
            thumbnail_url: "https://images.unsplash.com/photo-1611746872915-64382b5c76da?w=600&q=80",
            category: { id: 7, name: "AI & Automation", slug: "ai-automation" },
            basic_price_sol: 3,
            average_rating: 4.6,
            total_reviews: 34,
            profile: { display_name: "Bot Builder", avatar_url: "https://i.pravatar.cc/150?u=botbuilder" },
        },
    ],
}

export function FeaturedGigs() {
    const [featuredServices, setFeaturedServices] = useState<Record<string, FeaturedService[]>>(MOCK_FEATURED)
    const [loading, setLoading] = useState(true)
    const sectionRef = useRef<HTMLElement>(null)
    const isInView = useInView(sectionRef, { once: true, margin: "-50px" })

    useEffect(() => {
        loadFeaturedServices()
    }, [])

    const loadFeaturedServices = async () => {
        setLoading(true)
        try {
            const data = await ServiceAPI.search({ limit: 50 })
            if (data.services && data.services.length > 0) {
                const grouped: Record<string, FeaturedService[]> = {}
                for (const section of FEATURED_SECTIONS) {
                    const categoryServices = data.services
                        .filter((s: Service) => s.category?.slug === section.slug)
                        .slice(0, 4) as FeaturedService[]
                    if (categoryServices.length > 0) {
                        grouped[section.id] = categoryServices
                    }
                }
                if (Object.keys(grouped).length > 0) {
                    setFeaturedServices(grouped)
                }
            }
        } catch (error) {
            console.error("Failed to load featured services:", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <section ref={sectionRef} className="py-24 bg-[#030305] relative overflow-hidden">
            {/* Subtle background gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#020204] via-[#030305] to-[#020204]" />

            <div className="container max-w-7xl mx-auto px-6 relative z-10">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-16"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={isInView ? { opacity: 1, scale: 1 } : {}}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-6"
                    >
                        <motion.div
                            animate={{ rotate: [0, 15, -15, 0] }}
                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                        >
                            <Sparkles className="w-4 h-4 text-indigo-400" />
                        </motion.div>
                        <span className="text-indigo-400 text-sm font-medium tracking-wide">
                            Featured Work
                        </span>
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.5, delay: 0.15 }}
                        className="text-4xl md:text-5xl font-bold text-white mb-4"
                    >
                        Discover Top Talent
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-zinc-400 text-lg max-w-2xl mx-auto"
                    >
                        Browse curated portfolios from verified professionals
                    </motion.p>
                </motion.div>

                {/* Category Sections */}
                <div className="space-y-20">
                    {FEATURED_SECTIONS.map((section, sectionIndex) => {
                        const services = featuredServices[section.id] || []

                        return (
                            <motion.div
                                key={section.id}
                                initial={{ opacity: 0, y: 40 }}
                                animate={isInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.6, delay: sectionIndex * 0.15 }}
                            >
                                {/* Category Header */}
                                <div className="flex items-end justify-between mb-8">
                                    <div>
                                        <h3 className="text-2xl font-semibold text-white mb-1">
                                            {section.title}
                                        </h3>
                                        <p className="text-zinc-500 text-sm">
                                            {section.subtitle}
                                        </p>
                                    </div>
                                    <Link
                                        to={`/gigs?category=${section.slug}`}
                                        className="hidden sm:flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors group/link"
                                    >
                                        <span className="relative">
                                            View all
                                            <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-white/50 group-hover/link:w-full transition-all duration-300" />
                                        </span>
                                        <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1.5 transition-transform duration-300" />
                                    </Link>
                                </div>

                                {/* Cards Grid - Fixed 4 columns on desktop */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
                                    {loading ? (
                                        [...Array(4)].map((_, i) => (
                                            <SkeletonCard key={i} />
                                        ))
                                    ) : (
                                        services.map((service, index) => (
                                            <GigCard
                                                key={service.id}
                                                service={service}
                                                index={index}
                                                accentColor={section.accentColor}
                                            />
                                        ))
                                    )}
                                </div>

                                {/* Mobile View All Link */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={isInView ? { opacity: 1 } : {}}
                                    transition={{ duration: 0.4, delay: 0.4 }}
                                >
                                    <Link
                                        to={`/gigs?category=${section.slug}`}
                                        className="sm:hidden flex items-center justify-center gap-2 mt-6 py-3 text-sm text-zinc-400 hover:text-white transition-colors group/mobile"
                                    >
                                        <span>View all {section.title.toLowerCase()}</span>
                                        <ArrowRight className="w-4 h-4 group-hover/mobile:translate-x-1 transition-transform" />
                                    </Link>
                                </motion.div>
                            </motion.div>
                        )
                    })}
                </div>

                {/* Bottom CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="mt-20 text-center"
                >
                    <Link to="/gigs">
                        <GradientSlideButton
                            className="h-14 px-10 text-base font-semibold rounded-full shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-shadow duration-300"
                            colorFrom="#6366f1"
                            colorTo="#8b5cf6"
                        >
                            Explore All Gigs
                            <motion.span
                                className="inline-block"
                                whileHover={{ x: 4 }}
                                transition={{ type: "spring", stiffness: 400 }}
                            >
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </motion.span>
                        </GradientSlideButton>
                    </Link>
                </motion.div>
            </div>
        </section>
    )
}

// Skeleton loader card with shimmer
function SkeletonCard() {
    return (
        <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] overflow-hidden relative">
            {/* Shimmer overlay */}
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/[0.03] to-transparent" />

            <div className="aspect-[4/3] bg-gradient-to-br from-white/[0.04] to-white/[0.02]">
                <div className="w-full h-full animate-pulse" />
            </div>
            <div className="p-4 space-y-3">
                <div className="h-4 bg-white/[0.04] rounded-lg w-full animate-pulse" />
                <div className="h-4 bg-white/[0.04] rounded-lg w-4/5 animate-pulse" />
                <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-white/[0.04] rounded-full animate-pulse" />
                        <div className="h-3 bg-white/[0.04] rounded-lg w-16 animate-pulse" />
                    </div>
                    <div className="h-4 bg-white/[0.04] rounded-lg w-14 animate-pulse" />
                </div>
            </div>
        </div>
    )
}

// Professional Gig Card with micro-animations
function GigCard({
    service,
    index,
    accentColor
}: {
    service: FeaturedService
    index: number
    accentColor: string
}) {
    const cardRef = useRef<HTMLDivElement>(null)
    const isCardInView = useInView(cardRef, { once: true, margin: "-50px" })

    const accentColors: Record<string, { border: string; glow: string; badge: string }> = {
        rose: {
            border: "group-hover:border-rose-500/40",
            glow: "group-hover:shadow-rose-500/20",
            badge: "bg-rose-500/10 border-rose-500/30"
        },
        indigo: {
            border: "group-hover:border-indigo-500/40",
            glow: "group-hover:shadow-indigo-500/20",
            badge: "bg-indigo-500/10 border-indigo-500/30"
        },
        emerald: {
            border: "group-hover:border-emerald-500/40",
            glow: "group-hover:shadow-emerald-500/20",
            badge: "bg-emerald-500/10 border-emerald-500/30"
        },
    }

    const colors = accentColors[accentColor] || accentColors.indigo

    return (
        <Link to={`/gigs/${service.id}`}>
            <motion.div
                ref={cardRef}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={isCardInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{
                    duration: 0.5,
                    delay: index * 0.1,
                    ease: [0.25, 0.46, 0.45, 0.94]
                }}
                whileHover={{ y: -6, transition: { duration: 0.25, ease: "easeOut" } }}
                className={cn(
                    "group relative rounded-2xl bg-[#0a0a0c] border border-white/[0.06] overflow-hidden",
                    "hover:bg-[#0c0c0f] transition-all duration-300",
                    "shadow-lg shadow-black/20",
                    "group-hover:shadow-xl",
                    colors.border,
                    colors.glow
                )}
            >
                {/* Hover Glow Effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                    <div className={cn(
                        "absolute -inset-px rounded-2xl",
                        accentColor === 'rose' && "bg-gradient-to-br from-rose-500/10 via-transparent to-transparent",
                        accentColor === 'indigo' && "bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent",
                        accentColor === 'emerald' && "bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent"
                    )} />
                </div>

                {/* Image Container - Fixed Aspect Ratio */}
                <div className="aspect-[4/3] relative overflow-hidden bg-gradient-to-br from-white/[0.02] to-transparent">
                    {service.thumbnail_url ? (
                        <motion.img
                            src={service.thumbnail_url}
                            alt={service.title}
                            className="w-full h-full object-cover"
                            whileHover={{ scale: 1.08 }}
                            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo-500/10 to-violet-500/10" />
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300" />

                    {/* Shimmer Effect on Hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                    </div>

                    {/* Rating Badge */}
                    {(service.average_rating ?? 0) > 0 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={isCardInView ? { opacity: 1, scale: 1 } : {}}
                            transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
                            className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-black/70 backdrop-blur-md border border-white/10"
                        >
                            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                            <span className="text-xs font-semibold text-white">
                                {service.average_rating?.toFixed(1)}
                            </span>
                        </motion.div>
                    )}
                </div>

                {/* Content */}
                <div className="p-4">
                    {/* Title - Fixed 2 lines */}
                    <h4 className="text-sm font-medium text-white line-clamp-2 mb-3 min-h-[40px] group-hover:text-white transition-colors duration-200">
                        {service.title}
                    </h4>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                        {/* Creator */}
                        <div className="flex items-center gap-2">
                            <motion.div
                                className="w-6 h-6 rounded-full overflow-hidden bg-gradient-to-br from-zinc-700 to-zinc-800 flex-shrink-0 ring-2 ring-transparent group-hover:ring-white/10 transition-all duration-300"
                                whileHover={{ scale: 1.1 }}
                            >
                                {service.profile?.avatar_url ? (
                                    <img
                                        src={service.profile.avatar_url}
                                        alt=""
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-zinc-400">
                                        {(service.profile?.display_name || 'A')[0].toUpperCase()}
                                    </div>
                                )}
                            </motion.div>
                            <span className="text-xs text-zinc-500 truncate max-w-[80px] group-hover:text-zinc-400 transition-colors">
                                {service.profile?.display_name || 'Creator'}
                            </span>
                        </div>

                        {/* Price */}
                        {service.basic_price_sol && (
                            <motion.div
                                className="text-right"
                                whileHover={{ scale: 1.05 }}
                            >
                                <span className="text-[10px] text-zinc-500 uppercase tracking-wide">From</span>
                                <p className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors duration-200">
                                    {service.basic_price_sol} SOL
                                </p>
                            </motion.div>
                        )}
                    </div>
                </div>
            </motion.div>
        </Link>
    )
}
