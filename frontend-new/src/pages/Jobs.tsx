import { useState, useEffect } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { Search, Filter, Star, Shield, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { fetchJobs } from "@/lib/api"
import { cn } from "@/lib/utils"

// Enhanced mock data with escrow status, client rating, etc.
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
        featured: true
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
        featured: false
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
        featured: false
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
        featured: false
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
        featured: true
    }
]

const CATEGORIES = [
    { value: "all", label: "All Categories" },
    { value: "blockchain", label: "Blockchain & Web3" },
    { value: "development", label: "Web Development" },
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

const PAYMENT_TYPES = [
    { value: "all", label: "Any Type" },
    { value: "fixed", label: "Fixed Price" },
    { value: "milestone", label: "Milestone" },
]

export function Jobs() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()

    // Filter states
    const [searchQuery, setSearchQuery] = useState("")
    const [category, setCategory] = useState(searchParams.get("category") || "all")
    const [experienceLevel, setExperienceLevel] = useState("all")
    const [paymentType, setPaymentType] = useState("all")
    const [budgetRange, setBudgetRange] = useState([0, 200])
    const [showVerifiedOnly, setShowVerifiedOnly] = useState(false)
    const [showFundedOnly, setShowFundedOnly] = useState(false)
    const [showFilters, setShowFilters] = useState(false)

    // Data states
    const [jobs, setJobs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Get initial filter from URL
    useEffect(() => {
        const filterParam = searchParams.get("filter")
        if (filterParam) {
            // Map old filter names to new categories
            const categoryMap: Record<string, string> = {
                "Development": "development",
                "Design": "design",
                "Marketing": "marketing",
                "Writing": "writing",
                "Blockchain & Web3": "blockchain",
            }
            setCategory(categoryMap[filterParam] || "all")
        }
    }, [])

    // Fetch and filter jobs
    useEffect(() => {
        const loadJobs = async () => {
            setLoading(true)
            try {
                // Try backend first
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
                    featured: false
                }))

                // Fallback to mock data if empty
                if (mappedJobs.length === 0) {
                    mappedJobs = JOBS
                }

                // Apply client-side filters
                let filtered = mappedJobs.filter((job: any) => {
                    // Search query
                    if (searchQuery && !job.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
                        !job.company.toLowerCase().includes(searchQuery.toLowerCase())) {
                        return false
                    }
                    // Budget range
                    if (job.budgetSol < budgetRange[0] || job.budgetSol > budgetRange[1]) {
                        return false
                    }
                    // Experience level
                    if (experienceLevel !== "all" && job.experienceLevel.toLowerCase() !== experienceLevel) {
                        return false
                    }
                    // Payment type
                    if (paymentType !== "all" && job.type.toLowerCase() !== paymentType) {
                        return false
                    }
                    // Verified clients only
                    if (showVerifiedOnly && !job.clientVerified) {
                        return false
                    }
                    // Funded escrow only
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
                // Apply filters to mock data
                setJobs(JOBS)
            } finally {
                setLoading(false)
            }
        }

        const debounceTimer = setTimeout(loadJobs, 300)
        return () => clearTimeout(debounceTimer)
    }, [searchQuery, category, experienceLevel, paymentType, budgetRange, showVerifiedOnly, showFundedOnly])

    const clearFilters = () => {
        setCategory("all")
        setExperienceLevel("all")
        setPaymentType("all")
        setBudgetRange([0, 200])
        setShowVerifiedOnly(false)
        setShowFundedOnly(false)
        setSearchQuery("")
    }

    const hasActiveFilters = category !== "all" || experienceLevel !== "all" || paymentType !== "all" ||
        showVerifiedOnly || showFundedOnly || budgetRange[0] > 0 || budgetRange[1] < 200

    return (
        <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-20">
            {/* Header Section */}
            <section className="container max-w-6xl mx-auto px-6 mb-8">
                <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-white mb-4">
                    Find your next <span className="text-zinc-500">crypto gig.</span>
                </h1>
                <p className="text-lg text-zinc-400 max-w-2xl leading-relaxed">
                    Curated opportunities from top Web3 teams. Paid in crypto, secured by smart contracts.
                </p>
            </section>

            {/* Main Content */}
            <section className="container max-w-6xl mx-auto px-6">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Filter Sidebar */}
                    <aside className={cn(
                        "lg:w-64 shrink-0",
                        showFilters ? "block" : "hidden lg:block"
                    )}>
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 sticky top-24">
                            {/* Filter Header */}
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-sm font-semibold text-white">Filters</h3>
                                {hasActiveFilters && (
                                    <button
                                        onClick={clearFilters}
                                        className="text-xs text-purple-400 hover:text-purple-300"
                                    >
                                        Clear all
                                    </button>
                                )}
                            </div>

                            {/* Category Filter */}
                            <div className="mb-6">
                                <label className="block text-xs font-medium text-zinc-400 mb-2">Category</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full h-10 px-3 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                >
                                    {CATEGORIES.map(cat => (
                                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Budget Range */}
                            <div className="mb-6">
                                <label className="block text-xs font-medium text-zinc-400 mb-2">
                                    Budget (SOL): {budgetRange[0]} - {budgetRange[1]}+
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="200"
                                    value={budgetRange[1]}
                                    onChange={(e) => setBudgetRange([budgetRange[0], parseInt(e.target.value)])}
                                    className="w-full accent-purple-500"
                                />
                            </div>

                            {/* Experience Level */}
                            <div className="mb-6">
                                <label className="block text-xs font-medium text-zinc-400 mb-2">Experience Level</label>
                                <select
                                    value={experienceLevel}
                                    onChange={(e) => setExperienceLevel(e.target.value)}
                                    className="w-full h-10 px-3 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                >
                                    {EXPERIENCE_LEVELS.map(level => (
                                        <option key={level.value} value={level.value}>{level.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Payment Type */}
                            <div className="mb-6">
                                <label className="block text-xs font-medium text-zinc-400 mb-2">Payment Type</label>
                                <select
                                    value={paymentType}
                                    onChange={(e) => setPaymentType(e.target.value)}
                                    className="w-full h-10 px-3 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                >
                                    {PAYMENT_TYPES.map(type => (
                                        <option key={type.value} value={type.value}>{type.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Toggle Filters */}
                            <div className="space-y-3">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={showVerifiedOnly}
                                        onChange={(e) => setShowVerifiedOnly(e.target.checked)}
                                        className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-purple-500 focus:ring-purple-500/20"
                                    />
                                    <span className="text-sm text-zinc-400 group-hover:text-white flex items-center gap-1.5">
                                        <CheckCircle className="w-3.5 h-3.5 text-blue-400" />
                                        Verified Clients
                                    </span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={showFundedOnly}
                                        onChange={(e) => setShowFundedOnly(e.target.checked)}
                                        className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-purple-500 focus:ring-purple-500/20"
                                    />
                                    <span className="text-sm text-zinc-400 group-hover:text-white flex items-center gap-1.5">
                                        <Shield className="w-3.5 h-3.5 text-emerald-400" />
                                        Escrow Funded
                                    </span>
                                </label>
                            </div>
                        </div>
                    </aside>

                    {/* Job List */}
                    <div className="flex-1">
                        {/* Search Bar */}
                        <div className="flex gap-3 mb-6">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                                <input
                                    type="text"
                                    placeholder="Search jobs, skills, companies..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full h-12 pl-12 pr-4 bg-zinc-900/50 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/50 transition-all"
                                />
                            </div>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="lg:hidden h-12 w-12 flex items-center justify-center rounded-xl bg-zinc-900/50 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
                            >
                                <Filter className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Results Count */}
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-sm text-zinc-400">
                                {loading ? "Loading..." : `${jobs.length} jobs found`}
                            </p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Job Cards */}
                        <div className="space-y-4">
                            {loading ? (
                                <div className="text-center py-20 text-zinc-500">Loading jobs...</div>
                            ) : jobs.length === 0 ? (
                                <div className="text-center py-20">
                                    <p className="text-zinc-400 mb-2">No jobs match your filters</p>
                                    <button onClick={clearFilters} className="text-purple-400 hover:text-purple-300 text-sm">
                                        Clear filters to see all jobs
                                    </button>
                                </div>
                            ) : (
                                jobs.map((job) => (
                                    <JobCard
                                        key={job.id}
                                        job={job}
                                        onClick={() => navigate(`/jobs/${job.id}`)}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

// Enhanced Job Card Component
function JobCard({ job, onClick }: { job: any; onClick: () => void }) {
    return (
        <div
            onClick={onClick}
            className="group relative p-6 bg-zinc-900/30 rounded-2xl border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/50 transition-all duration-300 cursor-pointer"
        >
            {/* Featured badge */}
            {job.featured && (
                <div className="absolute -top-px -right-px">
                    <div className="bg-gradient-to-bl from-purple-500 to-transparent w-16 h-16 opacity-20 rounded-tr-2xl" />
                </div>
            )}

            <div className="flex flex-col md:flex-row gap-6 md:items-start justify-between">
                {/* Job Info */}
                <div className="flex-1">
                    {/* Title Row */}
                    <div className="flex items-start gap-3 mb-3">
                        <h3 className="text-xl font-semibold text-white group-hover:text-purple-400 transition-colors">
                            {job.title}
                        </h3>
                        {job.featured && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-400 uppercase tracking-wider border border-purple-500/20 shrink-0">
                                Featured
                            </span>
                        )}
                    </div>

                    {/* Company & Client Info */}
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
                            <span className="text-zinc-500">({job.clientJobs} jobs)</span>
                        </span>
                        <span className="text-zinc-500">{job.location}</span>
                    </div>

                    {/* Budget & Escrow Status */}
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                        <span className="text-lg font-semibold text-white">
                            ◎ {job.budgetMin === job.budgetMax ? job.budgetSol : `${job.budgetMin} - ${job.budgetMax}`} SOL
                        </span>
                        <span className={cn(
                            "px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5",
                            job.escrowStatus === "funded"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                        )}>
                            <Shield className="w-3 h-3" />
                            {job.escrowStatus === "funded" ? "Escrow Funded" : "Not Funded"}
                        </span>
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-800 text-zinc-400 border border-zinc-700">
                            {job.type}
                        </span>
                    </div>

                    {/* Skills Tags */}
                    <div className="flex flex-wrap gap-2">
                        {job.skills.map((skill: string) => (
                            <span
                                key={skill}
                                className="px-2.5 py-1 rounded-md bg-zinc-800/50 border border-zinc-800 text-xs text-zinc-400 group-hover:border-zinc-700 transition-colors"
                            >
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Apply Action */}
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-4 mt-4 md:mt-0 md:pl-6 md:border-l border-zinc-800/50">
                    <span className="text-xs text-zinc-500 font-medium">{job.posted}</span>
                    <Button
                        className="w-full md:w-auto bg-white text-black hover:bg-zinc-200"
                        onClick={(e) => {
                            e.stopPropagation()
                            // Navigate to job detail
                        }}
                    >
                        View Details
                    </Button>
                </div>
            </div>
        </div>
    )
}
