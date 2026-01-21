import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { Search, MapPin, DollarSign, Star, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { fetchTalent, type ProfileResponse } from "@/lib/api"

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

export function Talent() {
    const [searchParams, setSearchParams] = useSearchParams()
    const [activeFilter, setActiveFilter] = useState("All")
    const [searchQuery, setSearchQuery] = useState("")
    const [profiles, setProfiles] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

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
        <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-12">
            <div className="container max-w-6xl mx-auto px-6">

                {/* Header */}
                <div className="mb-12 text-center max-w-3xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6">
                        Discover World-Class <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">Web3 Talent</span>
                    </h1>
                    <p className="text-lg text-zinc-400">
                        Connect with top-tier developers, designers, and auditors. Verified on-chain.
                    </p>
                </div>

                {/* Search & Filter */}
                <div className="flex flex-col md:flex-row gap-4 mb-10">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 h-5 w-5 text-zinc-500" />
                        <input
                            type="text"
                            placeholder="Search by role, name, or skill..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-11 pl-10 pr-4 bg-zinc-900/50 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/50 transition-all"
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                        {["All", "Developers", "Designers", "Auditors"].map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`h-11 px-6 rounded-lg text-sm font-medium whitespace-nowrap transition-all border ${activeFilter === filter
                                    ? "bg-white text-black border-white"
                                    : "bg-zinc-900/50 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700"
                                    }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="text-center py-20">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-500 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
                        <p className="mt-4 text-zinc-500">Searching the blockchain...</p>
                    </div>
                ) : (
                    <>
                        {error && (
                            <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-200 text-sm text-center">
                                {error}
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {profiles.map((profile) => (
                                <div key={profile.id} className="group relative bg-zinc-900/40 border border-zinc-800/50 rounded-xl p-6 hover:bg-zinc-900/60 hover:border-zinc-700 transition-all cursor-pointer">

                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <img src={profile.avatar} alt={profile.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-zinc-800" />
                                                {profile.available && (
                                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-zinc-900 rounded-full"></div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-1.5">
                                                    <h3 className="font-semibold text-white group-hover:text-purple-400 transition-colors">{profile.name}</h3>
                                                    {profile.verified && <ShieldCheck className="w-4 h-4 text-blue-400" />}
                                                </div>
                                                <p className="text-sm text-zinc-400">{profile.title}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 bg-yellow-400/10 px-2 py-1 rounded text-xs font-medium text-yellow-400">
                                            <Star className="w-3 h-3 fill-yellow-400" />
                                            {profile.rating}
                                        </div>
                                    </div>

                                    {/* Details */}
                                    <div className="flex items-center gap-4 text-xs text-zinc-500 mb-6 font-medium">
                                        <div className="flex items-center gap-1.5">
                                            <DollarSign className="w-3.5 h-3.5" />
                                            {profile.rate}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <MapPin className="w-3.5 h-3.5" />
                                            {profile.location}
                                        </div>
                                    </div>

                                    {/* Skills */}
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {profile.skills.slice(0, 4).map((skill: string, i: number) => (
                                            <span key={i} className="px-2.5 py-1 bg-zinc-800/50 text-zinc-400 text-xs rounded-md border border-zinc-800">
                                                {skill}
                                            </span>
                                        ))}
                                        {profile.skills.length > 4 && (
                                            <span className="px-2.5 py-1 text-zinc-500 text-xs text-xs">+{profile.skills.length - 4}</span>
                                        )}
                                    </div>

                                    <Button className="w-full bg-white text-black hover:bg-zinc-200">
                                        View Profile
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
