import { useState, useEffect, useRef } from "react"
import { useSearchParams, Link } from "react-router-dom"
import { Search, MapPin, Star, ShieldCheck, Users } from "lucide-react"
import { motion, useInView } from "framer-motion"
import { fetchTalent, type ProfileResponse } from "@/lib/api"
import { cn } from "@/lib/utils"

// Mock data for fallback (Premium Freelancers)
const PROFILES = [
    {
        id: "1",
        name: "Alex Rivera",
        title: "Senior Rust Engineer",
        rate: "65 SOL/hr",
        location: "Buenos Aires, AR",
        avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
        verified: true,
        skills: ["Rust", "Solana", "Anchor", "React"],
        available: true,
        rating: 4.9
    },
    {
        id: "2",
        name: "Sarah Chen",
        title: "Web3 Product Designer",
        rate: "40 SOL/hr",
        location: "Toronto, CA",
        avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
        verified: true,
        skills: ["Figma", "UI/UX", "Design Systems"],
        available: true,
        rating: 5.0
    },
    {
        id: "3",
        name: "Dmitry Volkov",
        title: "Smart Contract Auditor",
        rate: "90 SOL/hr",
        location: "Berlin, DE",
        avatar: "https://i.pravatar.cc/150?u=a04258114e29026302d",
        verified: true,
        skills: ["Solidity", "Rust", "Security", "Audit"],
        available: false,
        rating: 5.0
    },
    {
        id: "4",
        name: "Jessica Wu",
        title: "Frontend Developer",
        rate: "45 SOL/hr",
        location: "Singapore, SG",
        avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
        verified: false,
        skills: ["React", "TypeScript", "Next.js", "Tailwind"],
        available: true,
        rating: 4.8
    },
    {
        id: "5",
        name: "Marcus Johnson",
        title: "Blockchain Architect",
        rate: "80 SOL/hr",
        location: "London, UK",
        avatar: "https://i.pravatar.cc/150?u=a048581f4e29026024d",
        verified: true,
        skills: ["Architecture", "Go", "Ethereum", "Solana"],
        available: true,
        rating: 4.9
    },
    {
        id: "6",
        name: "Olivia Pierre",
        title: "Community Manager",
        rate: "25 SOL/hr",
        location: "Paris, FR",
        avatar: "https://i.pravatar.cc/150?u=2042581f4e29026024d",
        verified: true,
        skills: ["Community", "Social Media", "Marketing"],
        available: true,
        rating: 4.7
    }
]

const filters = [
    { id: "All", label: "All Talent" },
    { id: "Developers", label: "Developers" },
    { id: "Designers", label: "Designers" },
    { id: "Auditors", label: "Auditors" }
]

export function Talent() {
    const [searchParams, setSearchParams] = useSearchParams()
    const [activeFilter, setActiveFilter] = useState("All")
    const [searchQuery, setSearchQuery] = useState("")
    const [profiles, setProfiles] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const heroRef = useRef<HTMLDivElement>(null)
    const isHeroInView = useInView(heroRef, { once: true })

    // Update URL when filter changes
    useEffect(() => {
        if (activeFilter === "All") {
            searchParams.delete("filter")
        } else {
            searchParams.set("filter", activeFilter)
        }
        setSearchParams(searchParams)
    }, [activeFilter])

    useEffect(() => {
        const loadProfiles = async () => {
            setLoading(true)
            try {
                const data = await fetchTalent(searchQuery)

                let mappedProfiles = (data.profiles || []).map((p: ProfileResponse) => ({
                    id: p.profile.id,
                    name: p.profile.display_name,
                    title: p.profile.professional_title,
                    rate: `${p.profile.hourly_rate_sol || '?'} SOL/hr`,
                    location: p.profile.country || "Remote",
                    avatar: p.profile.avatar_url || `https://ui-avatars.com/api/?name=${p.profile.display_name}`,
                    verified: true, // Assuming for now
                    skills: p.skills ? p.skills.map(s => s.name) : [],
                    available: p.profile.available_for_hire,
                    rating: 5.0 // Placeholder
                }))

                // Fallback to mock data if backend is empty
                if (mappedProfiles.length === 0) {
                    console.log("No talent from backend, using mock data")
                    mappedProfiles = PROFILES.filter(profile =>
                        profile.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        profile.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
                    )

                    if (activeFilter !== "All") {
                        // Simple categorical filtering logic for mock data
                        if (activeFilter === "Developers") {
                            mappedProfiles = mappedProfiles.filter(p => p.title?.includes("Engineer") || p.title?.includes("Developer") || p.title?.includes("Architect") || p.title?.includes("Auditor"))
                        } else if (activeFilter === "Designers") {
                            mappedProfiles = mappedProfiles.filter(p => p.title?.includes("Designer"))
                        }
                    }
                }

                setProfiles(mappedProfiles)
                setError(null)
            } catch (err) {
                console.error("Failed to fetch talent:", err)
                setError("Failed to load talent. Showing demo profiles.")
                setProfiles(PROFILES) // Fallback on error
            } finally {
                setLoading(false)
            }
        }

        const timer = setTimeout(() => {
            loadProfiles()
        }, 300)

        return () => clearTimeout(timer)
    }, [searchQuery, activeFilter])

    return (
        <div className="min-h-screen bg-[#020204]">
            {/* Hero Section */}
            <section ref={heroRef} className="relative pt-24 pb-12 overflow-hidden border-b border-white/[0.06]">
                {/* Background Effects */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-[150px]" />
                    <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px]" />
                </div>

                <div className="container max-w-6xl mx-auto px-6 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6 }}
                        className="text-center max-w-3xl mx-auto mb-12"
                    >
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] mb-6">
                            <Users className="w-4 h-4 text-indigo-400" />
                            <span className="text-sm font-medium text-zinc-300">Verified Talent Pool</span>
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-white mb-6 leading-tight">
                            Discover{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-300 to-indigo-400">
                                World-Class
                            </span>
                            {" "}Talent
                        </h1>

                        <p className="text-lg md:text-xl text-zinc-400 leading-relaxed">
                            Connect with elite developers, designers, and auditors.
                            Every profile verified on-chain.
                        </p>
                    </motion.div>

                    {/* Search Bar */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="max-w-2xl mx-auto"
                    >
                        <div className="relative">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                            <input
                                type="text"
                                placeholder="Search by role, name, or skill..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-14 pl-14 pr-6 bg-[#0a0a0c] border border-white/[0.08] rounded-2xl text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all text-base"
                            />
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Filters + Content */}
            <section className="container max-w-6xl mx-auto px-6 py-10">
                {/* Filter Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="flex flex-wrap items-center gap-3 mb-10"
                >
                    {filters.map((filter) => (
                        <button
                            key={filter.id}
                            onClick={() => setActiveFilter(filter.id)}
                            className={cn(
                                "h-10 px-5 rounded-full text-sm font-medium transition-all duration-300",
                                activeFilter === filter.id
                                    ? "bg-white text-black"
                                    : "bg-white/[0.03] text-zinc-400 border border-white/[0.06] hover:border-white/15 hover:text-white"
                            )}
                        >
                            {filter.label}
                        </button>
                    ))}

                    {/* Results count */}
                    {!loading && (
                        <span className="ml-auto text-sm text-zinc-500">
                            {profiles.length} talent{profiles.length !== 1 ? 's' : ''} found
                        </span>
                    )}
                </motion.div>

                {/* Content */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-12 h-12 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin mb-4" />
                        <p className="text-zinc-500 text-sm">Searching the blockchain...</p>
                    </div>
                ) : (
                    <>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 text-sm text-center"
                            >
                                {error}
                            </motion.div>
                        )}

                        {profiles.length === 0 ? (
                            <div className="text-center py-20">
                                <div className="w-16 h-16 rounded-full bg-zinc-800/50 flex items-center justify-center mx-auto mb-4">
                                    <Users className="w-8 h-8 text-zinc-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">No talent found</h3>
                                <p className="text-zinc-500">Try adjusting your search or filters</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {profiles.map((profile, index) => (
                                    <TalentCard key={profile.id} profile={profile} index={index} />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </section>
        </div>
    )
}

function TalentCard({ profile, index }: { profile: any; index: number }) {
    const ref = useRef<HTMLDivElement>(null)
    const isInView = useInView(ref, { once: true, margin: "-50px" })

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: index * 0.05 }}
        >
            <Link to={`/talent/${profile.id}`}>
                <div className="group relative h-full rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden hover:border-indigo-500/30 hover:bg-white/[0.04] transition-all duration-300">
                    {/* Skills Banner - Work Focused at Top */}
                    <div className="p-4 bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border-b border-white/[0.06]">
                        <div className="flex flex-wrap gap-1.5">
                            {profile.skills.slice(0, 4).map((skill: string, i: number) => (
                                <span
                                    key={i}
                                    className="px-2.5 py-1 bg-black/40 backdrop-blur-sm border border-white/10 text-zinc-300 text-xs rounded-lg font-medium"
                                >
                                    {skill}
                                </span>
                            ))}
                            {profile.skills.length > 4 && (
                                <span className="px-2.5 py-1 text-zinc-500 text-xs">
                                    +{profile.skills.length - 4}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="p-5">
                        {/* Title - Prominent */}
                        <h3 className="font-semibold text-white text-lg mb-1 group-hover:text-indigo-400 transition-colors">
                            {profile.title}
                        </h3>

                        {/* Stats Row */}
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex items-center gap-1">
                                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                <span className="text-sm font-medium text-white">{profile.rating}</span>
                            </div>
                            <span className="text-indigo-400 font-semibold text-sm">◎ {profile.rate}</span>
                            {profile.available && (
                                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                                    <span className="text-[10px] font-medium text-indigo-400">Available</span>
                                </span>
                            )}
                        </div>

                        {/* Location */}
                        <div className="flex items-center gap-1.5 text-xs text-zinc-500 mb-4">
                            <MapPin className="w-3 h-3" />
                            {profile.location}
                        </div>

                        {/* Minimal Creator Info - At Bottom, Small */}
                        <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <img
                                        src={profile.avatar}
                                        alt={profile.name}
                                        className="w-7 h-7 rounded-full object-cover ring-1 ring-white/10"
                                    />
                                    {profile.verified && (
                                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-indigo-500 flex items-center justify-center ring-1 ring-[#0a0a0c]">
                                            <ShieldCheck className="w-2 h-2 text-white" />
                                        </div>
                                    )}
                                </div>
                                <span className="text-xs text-zinc-500">{profile.name}</span>
                            </div>
                            <span className="text-xs text-indigo-400 font-medium group-hover:text-indigo-300">
                                View Profile →
                            </span>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    )
}
