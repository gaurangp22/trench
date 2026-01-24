import { useState, useEffect, useRef } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { motion, useInView } from "framer-motion"
import { Search, Filter, Star, Shield, CheckCircle, X, ChevronDown, Briefcase, ArrowUpRight } from "lucide-react"
import { GradientSlideButton } from "@/components/ui/gradient-slide-button"
import { fetchJobs } from "@/lib/api"
import { cn } from "@/lib/utils"

const JOBS = [
    {
        id: 1,
        title: "Senior Smart Contract Engineer",
        company: "DeFi Protocol X",
        clientRating: 4.9,
        clientJobs: 12,
        type: "Fixed",
        location: "Remote",
        budgetSol: 175,
        budgetMin: 150,
        budgetMax: 200,
        posted: "2h ago",
        skills: ["Solana", "Rust", "Anchor"],
        escrowStatus: "funded",
        clientVerified: true,
        experienceLevel: "Expert",
        featured: true,
        description: "Build and audit smart contracts for our new AMM protocol"
    },
    {
        id: 2,
        title: "Product Designer (Web3)",
        company: "NFT Marketplace Y",
        clientRating: 4.7,
        clientJobs: 8,
        type: "Milestone",
        location: "Remote",
        budgetSol: 50,
        budgetMin: 40,
        budgetMax: 60,
        posted: "5h ago",
        skills: ["UI/UX", "Figma", "Design System"],
        escrowStatus: "not_funded",
        clientVerified: true,
        experienceLevel: "Intermediate",
        featured: false,
        description: "Design the next generation NFT trading experience"
    },
    {
        id: 3,
        title: "Rust Developer",
        company: "Infrastructure DAO",
        clientRating: 5.0,
        clientJobs: 24,
        type: "Fixed",
        location: "Remote",
        budgetSol: 100,
        budgetMin: 100,
        budgetMax: 100,
        posted: "1d ago",
        skills: ["Rust", "Systems", "Protocols"],
        escrowStatus: "funded",
        clientVerified: true,
        experienceLevel: "Expert",
        featured: false,
        description: "Optimize our RPC infrastructure for high throughput"
    },
    {
        id: 4,
        title: "Community Manager",
        company: "GameFi Project Z",
        clientRating: 4.2,
        clientJobs: 3,
        type: "Milestone",
        location: "Remote",
        budgetSol: 25,
        budgetMin: 20,
        budgetMax: 30,
        posted: "2d ago",
        skills: ["Social Media", "Discord", "Growth"],
        escrowStatus: "not_funded",
        clientVerified: false,
        experienceLevel: "Entry",
        featured: false,
        description: "Build and engage our gaming community across platforms"
    },
    {
        id: 5,
        title: "Frontend React Developer",
        company: "DeFi Lending Platform",
        clientRating: 4.8,
        clientJobs: 15,
        type: "Fixed",
        location: "Remote",
        budgetSol: 80,
        budgetMin: 70,
        budgetMax: 90,
        posted: "3h ago",
        skills: ["React", "TypeScript", "Web3.js"],
        escrowStatus: "funded",
        clientVerified: true,
        experienceLevel: "Intermediate",
        featured: true,
        description: "Build responsive interfaces for our lending protocol"
    }
]

const CATEGORIES = [
    { value: "all", label: "All Categories" },
    { value: "blockchain", label: "Blockchain & Web3" },
    { value: "development", label: "Development" },
    { value: "design", label: "Design" },
    { value: "writing", label: "Writing" },
    { value: "marketing", label: "Marketing" },
]

const EXPERIENCE_LEVELS = [
    { value: "all", label: "Any Level" },
    { value: "entry", label: "Entry Level" },
    { value: "intermediate", label: "Intermediate" },
    { value: "expert", label: "Expert" },
]

export function Jobs() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const headerRef = useRef<HTMLDivElement>(null)
    const isHeaderInView = useInView(headerRef, { once: true })

    const [searchQuery, setSearchQuery] = useState("")
    const [category, setCategory] = useState(searchParams.get("category") || "all")
    const [experienceLevel, setExperienceLevel] = useState("all")
    const [budgetRange, setBudgetRange] = useState([0, 200])
    const [showVerifiedOnly, setShowVerifiedOnly] = useState(false)
    const [showFundedOnly, setShowFundedOnly] = useState(false)
    const [showFilters, setShowFilters] = useState(false)

    const [jobs, setJobs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const filterParam = searchParams.get("filter")
        if (filterParam) {
            const categoryMap: Record<string, string> = {
                "Development": "development",
                "Design": "design",
                "Marketing": "marketing",
                "Writing": "writing",
                "Blockchain": "blockchain",
            }
            setCategory(categoryMap[filterParam] || "all")
        }
    }, [])

    useEffect(() => {
        const loadJobs = async () => {
            setLoading(true)
            try {
                const data = await fetchJobs(searchQuery, category)
                let mappedJobs = (data.jobs || []).map((job: any) => ({
                    id: job.id,
                    title: job.title,
                    company: job.company_name || "Unknown Company",
                    clientRating: 4.5,
                    clientJobs: 5,
                    type: job.payment_type === 'fixed' ? 'Fixed' : 'Milestone',
                    location: "Remote",
                    budgetSol: job.budget_min_sol || 50,
                    budgetMin: job.budget_min_sol || 50,
                    budgetMax: job.budget_max_sol || 100,
                    posted: new Date(job.created_at).toLocaleDateString(),
                    skills: job.skills ? job.skills.map((s: any) => s.name) : ["Blockchain"],
                    escrowStatus: "not_funded",
                    clientVerified: true,
                    experienceLevel: "Intermediate",
                    featured: false,
                    description: job.description?.slice(0, 100) || ""
                }))

                if (mappedJobs.length === 0) {
                    mappedJobs = JOBS
                }

                let filtered = mappedJobs.filter((job: any) => {
                    if (searchQuery && !job.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
                        !job.company.toLowerCase().includes(searchQuery.toLowerCase())) {
                        return false
                    }
                    if (job.budgetSol < budgetRange[0] || job.budgetSol > budgetRange[1]) {
                        return false
                    }
                    if (experienceLevel !== "all" && job.experienceLevel.toLowerCase() !== experienceLevel) {
                        return false
                    }
                    if (showVerifiedOnly && !job.clientVerified) {
                        return false
                    }
                    if (showFundedOnly && job.escrowStatus !== "funded") {
                        return false
                    }
                    return true
                })

                setJobs(filtered)
                setError(null)
            } catch (err) {
                console.error("Failed to fetch jobs:", err)
                setError("Unable to connect to backend. Showing demo data.")
                setJobs(JOBS)
            } finally {
                setLoading(false)
            }
        }

        const debounceTimer = setTimeout(loadJobs, 300)
        return () => clearTimeout(debounceTimer)
    }, [searchQuery, category, experienceLevel, budgetRange, showVerifiedOnly, showFundedOnly])

    const clearFilters = () => {
        setCategory("all")
        setExperienceLevel("all")
        setBudgetRange([0, 200])
        setShowVerifiedOnly(false)
        setShowFundedOnly(false)
        setSearchQuery("")
    }

    const hasActiveFilters = category !== "all" || experienceLevel !== "all" ||
        showVerifiedOnly || showFundedOnly || budgetRange[0] > 0 || budgetRange[1] < 200

    const activeFilterCount = [
        category !== "all",
        experienceLevel !== "all",
        showVerifiedOnly,
        showFundedOnly,
        budgetRange[0] > 0 || budgetRange[1] < 200
    ].filter(Boolean).length

    return (
        <div className="min-h-screen bg-[#020204] pt-24 pb-20">
            {/* Hero Header */}
            <section ref={headerRef} className="relative overflow-hidden border-b border-white/[0.04]">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[150px]" />
                    <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px]" />
                </div>

                <div className="container max-w-7xl mx-auto px-6 py-16 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6 }}
                        className="max-w-2xl"
                    >
                        <span className="text-sm font-mono text-emerald-400 tracking-wider uppercase mb-4 block">
                            {jobs.length} Opportunities
                        </span>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-white mb-6 leading-[1.1]">
                            Find your next
                            <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400">
                                crypto gig.
                            </span>
                        </h1>
                        <p className="text-lg text-zinc-400 leading-relaxed">
                            Curated opportunities from top Web3 teams. Paid in crypto, secured by smart contracts.
                        </p>
                    </motion.div>

                    {/* Search Bar */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="mt-10 max-w-2xl"
                    >
                        <div className="relative">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                            <input
                                type="text"
                                placeholder="Search jobs, skills, companies..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-14 pl-14 pr-6 bg-white/[0.03] border border-white/[0.08] rounded-2xl text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all text-lg"
                            />
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Main Content */}
            <section className="container max-w-7xl mx-auto px-6 py-10">
                {/* Filter Bar */}
                <div className="flex flex-wrap items-center gap-3 mb-8">
                    {/* Category Dropdown */}
                    <div className="relative">
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="h-10 pl-4 pr-10 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm text-white appearance-none cursor-pointer hover:border-white/20 focus:outline-none focus:border-emerald-500/50 transition-all"
                        >
                            {CATEGORIES.map(cat => (
                                <option key={cat.value} value={cat.value} className="bg-zinc-900">{cat.label}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                    </div>

                    {/* Experience Level */}
                    <div className="relative">
                        <select
                            value={experienceLevel}
                            onChange={(e) => setExperienceLevel(e.target.value)}
                            className="h-10 pl-4 pr-10 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm text-white appearance-none cursor-pointer hover:border-white/20 focus:outline-none focus:border-emerald-500/50 transition-all"
                        >
                            {EXPERIENCE_LEVELS.map(level => (
                                <option key={level.value} value={level.value} className="bg-zinc-900">{level.label}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                    </div>

                    {/* Toggle Buttons */}
                    <button
                        onClick={() => setShowVerifiedOnly(!showVerifiedOnly)}
                        className={cn(
                            "h-10 px-4 rounded-xl text-sm font-medium flex items-center gap-2 transition-all",
                            showVerifiedOnly
                                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                : "bg-white/[0.03] text-zinc-400 border border-white/[0.08] hover:border-white/20"
                        )}
                    >
                        <CheckCircle className="w-4 h-4" />
                        Verified
                    </button>

                    <button
                        onClick={() => setShowFundedOnly(!showFundedOnly)}
                        className={cn(
                            "h-10 px-4 rounded-xl text-sm font-medium flex items-center gap-2 transition-all",
                            showFundedOnly
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : "bg-white/[0.03] text-zinc-400 border border-white/[0.08] hover:border-white/20"
                        )}
                    >
                        <Shield className="w-4 h-4" />
                        Funded
                    </button>

                    {/* Clear Filters */}
                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className="h-10 px-4 rounded-xl text-sm font-medium text-zinc-400 hover:text-white flex items-center gap-2 transition-colors"
                        >
                            <X className="w-4 h-4" />
                            Clear
                        </button>
                    )}

                    {/* Results Count */}
                    <div className="ml-auto text-sm text-zinc-500">
                        {loading ? "Loading..." : `${jobs.length} jobs`}
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 text-sm">
                        {error}
                    </div>
                )}

                {/* Job Cards */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center py-20">
                            <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-zinc-500">Loading opportunities...</p>
                        </div>
                    ) : jobs.length === 0 ? (
                        <div className="text-center py-20">
                            <Briefcase className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                            <p className="text-zinc-400 mb-2">No jobs match your filters</p>
                            <button onClick={clearFilters} className="text-emerald-400 hover:text-purple-300 text-sm font-medium">
                                Clear filters to see all jobs
                            </button>
                        </div>
                    ) : (
                        jobs.map((job, index) => (
                            <JobCard
                                key={job.id}
                                job={job}
                                index={index}
                                onClick={() => navigate(`/jobs/${job.id}`)}
                            />
                        ))
                    )}
                </div>
            </section>
        </div>
    )
}

function JobCard({ job, index, onClick }: { job: any; index: number; onClick: () => void }) {
    const ref = useRef<HTMLDivElement>(null)
    const isInView = useInView(ref, { once: true, margin: "-50px" })

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            onClick={onClick}
            className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0a0a0c] hover:border-white/15 transition-all duration-300 cursor-pointer"
        >
            {/* Featured highlight */}
            {job.featured && (
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
            )}

            <div className="p-6 md:p-8">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                        {/* Header Row */}
                        <div className="flex items-start gap-3 mb-4">
                            <h3 className="text-xl font-semibold text-white group-hover:text-emerald-400 transition-colors">
                                {job.title}
                            </h3>
                            {job.featured && (
                                <span className="shrink-0 px-2 py-1 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-400 uppercase tracking-wider border border-emerald-500/20">
                                    Featured
                                </span>
                            )}
                        </div>

                        {/* Company & Meta */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm mb-4">
                            <span className="flex items-center gap-1.5">
                                <span className="font-medium text-zinc-300">{job.company}</span>
                                {job.clientVerified && (
                                    <CheckCircle className="w-3.5 h-3.5 text-blue-400" />
                                )}
                            </span>
                            <span className="flex items-center gap-1 text-amber-400">
                                <Star className="w-3.5 h-3.5 fill-current" />
                                <span>{job.clientRating}</span>
                                <span className="text-zinc-600">({job.clientJobs})</span>
                            </span>
                            <span className="text-zinc-600">{job.posted}</span>
                        </div>

                        {/* Budget & Status */}
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                            <span className="text-2xl font-bold text-white">
                                ◎ {job.budgetMin === job.budgetMax ? job.budgetSol : `${job.budgetMin}-${job.budgetMax}`}
                            </span>
                            <span className="text-sm text-zinc-500">SOL</span>

                            <span className={cn(
                                "px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5",
                                job.escrowStatus === "funded"
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                    : "bg-zinc-800/50 text-zinc-500 border border-zinc-700/50"
                            )}>
                                <Shield className="w-3 h-3" />
                                {job.escrowStatus === "funded" ? "Escrow Funded" : "Not Funded"}
                            </span>

                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-zinc-800/50 text-zinc-400 border border-zinc-700/50">
                                {job.type}
                            </span>
                        </div>

                        {/* Skills */}
                        <div className="flex flex-wrap gap-2">
                            {job.skills.map((skill: string) => (
                                <span
                                    key={skill}
                                    className="px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs text-zinc-400 group-hover:border-white/10 transition-colors"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Action Side */}
                    <div className="flex lg:flex-col items-center lg:items-end justify-between lg:justify-start gap-4 pt-4 lg:pt-0 lg:pl-8 border-t lg:border-t-0 lg:border-l border-white/[0.04]">
                        <GradientSlideButton
                            className="rounded-xl px-6 py-2.5"
                            colorFrom="#10B981"
                            colorTo="#14F195"
                            onClick={(e) => {
                                e.stopPropagation()
                                onClick()
                            }}
                        >
                            <span className="flex items-center gap-2">
                                View Details
                                <ArrowUpRight className="w-4 h-4" />
                            </span>
                        </GradientSlideButton>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
