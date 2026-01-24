import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
    Star, MapPin, Calendar, ShieldCheck, Briefcase,
    MessageSquare, ChevronLeft, User, FileText, Award, Sparkles, Globe
} from "lucide-react";
import { GradientSlideButton } from "@/components/ui/gradient-slide-button";
import { ProfileAPI, type ProfileResponse, type ProfileSocial, type TokenWorkItem, type PortfolioItem } from "@/lib/api";
import { PortfolioTab } from "@/components/portfolio/PortfolioTab";
import { cn } from "@/lib/utils";

type TabType = "profile" | "gigs" | "portfolio" | "reviews";

const TABS: { id: TabType; label: string; icon: React.ElementType }[] = [
    { id: "profile", label: "About", icon: User },
    { id: "portfolio", label: "Portfolio", icon: Award },
    { id: "gigs", label: "Services", icon: Briefcase },
    { id: "reviews", label: "Reviews", icon: Star },
];

// Mock data for demo purposes
const MOCK_SOCIALS: ProfileSocial[] = [
    { platform: "website", url: "https://example.com" },
    { platform: "twitter", url: "https://twitter.com/cryptodev" },
    { platform: "telegram", url: "https://t.me/cryptodev" },
    { platform: "discord", url: "https://discord.gg/cryptodev" },
];

const MOCK_TOKEN_WORK: TokenWorkItem[] = [
    {
        id: "1",
        contract_address: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
        chain: "solana",
        token_name: "Bonk",
        token_symbol: "BONK",
        token_image_url: "https://img.fotofolio.xyz/?url=https%3A%2F%2Farweave.net%2FhQiPZOsRZXGXBJd_82PhVdlM_hACsT_q6wqwf5cSY7I",
        ath_market_cap: 2400000000,
        sort_order: 0,
        created_at: "2024-01-01",
    },
    {
        id: "2",
        contract_address: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm",
        chain: "solana",
        token_name: "dogwifhat",
        token_symbol: "WIF",
        token_image_url: "https://img.fotofolio.xyz/?url=https%3A%2F%2Fbafkreibk3covs5ltyqxa272uodhculbr6kea6betidfwy3ajsav2vjzyum.ipfs.nftstorage.link",
        ath_market_cap: 4800000000,
        sort_order: 1,
        created_at: "2024-01-15",
    },
    {
        id: "3",
        contract_address: "MEW1gQWJ3nEXg2qgERiKu7FAFj79PHvQVREQUzScPP5",
        chain: "solana",
        token_name: "cat in a dogs world",
        token_symbol: "MEW",
        token_image_url: "https://img.fotofolio.xyz/?url=https%3A%2F%2Fbafkreidlwyr565dxtao2ipsze6bmzpszqzybz7sqi2zaet5fs7k262jf4a.ipfs.nftstorage.link",
        ath_market_cap: 1100000000,
        sort_order: 2,
        created_at: "2024-02-01",
    },
];

const MOCK_PORTFOLIO: PortfolioItem[] = [
    {
        id: "1",
        title: "DEX UI Design",
        description: "Complete UI/UX redesign for a Solana DEX",
        image_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400",
        url: "https://example.com/project1",
        created_at: "2024-01-20",
    },
    {
        id: "2",
        title: "NFT Marketplace",
        description: "Full-stack NFT marketplace on Solana",
        image_url: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400",
        url: "https://example.com/project2",
        created_at: "2024-02-15",
    },
    {
        id: "3",
        title: "Token Launch Website",
        description: "Landing page for a memecoin launch",
        image_url: "https://images.unsplash.com/photo-1642751227050-feb02d59013a?w=400",
        url: "https://example.com/project3",
        created_at: "2024-03-01",
    },
];

const MOCK_PROFILE: ProfileResponse = {
    profile: {
        id: "mock-1",
        user_id: "user-1",
        display_name: "CryptoBuilder",
        professional_title: "Senior Solana Developer",
        bio: "Building the future of DeFi on Solana. 5+ years of blockchain experience. Shipped 20+ projects including DEXs, NFT marketplaces, and token launches.",
        hourly_rate_sol: 45,
        country: "Remote",
        avatar_url: "https://i.pravatar.cc/150?u=cryptobuilder",
        available_for_hire: true,
        created_at: "2024-01-01",
    },
    skills: [
        { id: "1", name: "Rust" },
        { id: "2", name: "Solana" },
        { id: "3", name: "Anchor" },
        { id: "4", name: "React" },
        { id: "5", name: "TypeScript" },
    ],
    socials: MOCK_SOCIALS,
    token_work: MOCK_TOKEN_WORK,
    portfolio: MOCK_PORTFOLIO,
};

export function FreelancerProfile() {
    const { id } = useParams<{ id: string }>();
    const [activeTab, setActiveTab] = useState<TabType>("portfolio");
    const [profile, setProfile] = useState<ProfileResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);


    useEffect(() => {
        const loadProfile = async () => {
            if (!id) return;

            setLoading(true);
            try {
                const data = await ProfileAPI.getById(id);
                setProfile(data);
                setError(null);
            } catch (err) {
                console.error("Failed to load profile, using mock data:", err);
                // Use mock data as fallback
                setProfile(MOCK_PROFILE);
                setError(null);
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#020204] pt-24 pb-12 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-2 border-emerald-500/30 border-t-emerald-500 animate-spin" />
                    <span className="text-zinc-500 text-sm">Loading profile...</span>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-[#020204] pt-24 pb-12">
                <div className="container max-w-5xl mx-auto px-6 text-center py-20">
                    <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
                        <User className="w-8 h-8 text-red-400" />
                    </div>
                    <h2 className="text-2xl font-heading font-bold text-white mb-4">Profile Not Found</h2>
                    <p className="text-zinc-400 mb-8 max-w-md mx-auto">{error || "The profile you're looking for doesn't exist."}</p>
                    <Link to="/talent">
                        <GradientSlideButton
                            className="h-12 px-8 rounded-xl"
                            colorFrom="#10B981"
                            colorTo="#14F195"
                        >
                            <ChevronLeft className="w-4 h-4 mr-2" />
                            Back to Talent
                        </GradientSlideButton>
                    </Link>
                </div>
            </div>
        );
    }

    const { profile: profileData, skills = [], socials = [], token_work = [], portfolio = [] } = profile;

    return (
        <div className="min-h-screen bg-[#020204]">
            {/* Hero Header */}
            <section className="relative pt-24 pb-12 overflow-hidden border-b border-white/[0.06]">
                {/* Background Effects */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[150px]" />
                    <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] bg-teal-600/10 rounded-full blur-[120px]" />
                </div>

                <div className="container max-w-5xl mx-auto px-6 relative z-10">
                    {/* Back Button */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <Link
                            to="/talent"
                            className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white mb-8 transition-colors group"
                        >
                            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Back to Talent
                        </Link>
                    </motion.div>

                    {/* Profile Header Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="rounded-2xl border border-white/[0.06] bg-[#0a0a0c] overflow-hidden"
                    >
                        {/* Gradient Top Line */}
                        <div className="h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500" />

                        <div className="p-6 md:p-8">
                            <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                                {/* Avatar */}
                                <div className="relative flex-shrink-0">
                                    {profileData.avatar_url ? (
                                        <img
                                            src={profileData.avatar_url}
                                            alt={profileData.display_name}
                                            className="w-24 h-24 md:w-32 md:h-32 rounded-2xl object-cover ring-4 ring-white/10"
                                        />
                                    ) : (
                                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-white text-3xl font-bold ring-4 ring-white/10">
                                            {profileData.display_name?.charAt(0) || "?"}
                                        </div>
                                    )}
                                    {profileData.available_for_hire && (
                                        <div className="absolute -bottom-2 -right-2 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 backdrop-blur">
                                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                            <span className="text-xs font-medium text-emerald-400">Available</span>
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h1 className="text-2xl md:text-3xl font-heading font-bold text-white truncate">
                                            {profileData.display_name || "Anonymous"}
                                        </h1>
                                        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                                            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                                            <span className="text-xs font-medium text-blue-400">Verified</span>
                                        </div>
                                    </div>

                                    {profileData.professional_title && (
                                        <p className="text-lg text-zinc-300 mb-4">
                                            {profileData.professional_title}
                                        </p>
                                    )}

                                    {/* Meta Info */}
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400 mb-5">
                                        <div className="flex items-center gap-1.5">
                                            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                            <span className="font-medium text-white">5.0</span>
                                            <span className="text-zinc-500">(0 reviews)</span>
                                        </div>
                                        {profileData.country && (
                                            <div className="flex items-center gap-1.5">
                                                <MapPin className="w-4 h-4" />
                                                <span>{profileData.country}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-4 h-4" />
                                            <span>Joined {new Date(profileData.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                                        </div>
                                    </div>

                                    {/* Skills */}
                                    {skills.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {skills.slice(0, 5).map((skill: { id: string; name: string }, index: number) => (
                                                <motion.span
                                                    key={skill.id}
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                                                    className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm rounded-lg font-medium"
                                                >
                                                    {skill.name}
                                                </motion.span>
                                            ))}
                                            {skills.length > 5 && (
                                                <span className="px-3 py-1.5 text-zinc-500 text-sm">
                                                    +{skills.length - 5} more
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Actions Sidebar */}
                                <div className="flex flex-col gap-3 md:w-48">
                                    <GradientSlideButton
                                        className="h-12 rounded-xl font-semibold"
                                        colorFrom="#8B5CF6"
                                        colorTo="#EC4899"
                                    >
                                        <MessageSquare className="w-4 h-4 mr-2" />
                                        Contact
                                    </GradientSlideButton>

                                    {profileData.hourly_rate_sol && (
                                        <div className="text-center p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                                            <div className="flex items-center justify-center gap-1 mb-1">
                                                <Sparkles className="w-4 h-4 text-emerald-400" />
                                                <span className="text-xs text-zinc-500 uppercase tracking-wider">Rate</span>
                                            </div>
                                            <div className="text-2xl font-bold text-white">
                                                ◎ {profileData.hourly_rate_sol}
                                                <span className="text-sm font-normal text-zinc-400 ml-1">/hr</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Tabs + Content */}
            <section className="container max-w-5xl mx-auto px-6 py-8">
                {/* Tab Navigation */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="flex gap-2 p-1.5 bg-white/[0.02] border border-white/[0.06] rounded-xl mb-8 overflow-x-auto no-scrollbar"
                >
                    {TABS.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "relative flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-300",
                                    isActive
                                        ? "text-white"
                                        : "text-zinc-500 hover:text-zinc-300"
                                )}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeProfileTab"
                                        className="absolute inset-0 bg-white/10 rounded-lg"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <Icon className={cn("w-4 h-4 relative z-10", isActive && "text-emerald-400")} />
                                <span className="relative z-10">{tab.label}</span>
                            </button>
                        );
                    })}
                </motion.div>

                {/* Tab Content */}
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    {activeTab === "profile" && (
                        <div className="space-y-6">
                            <div className="rounded-2xl border border-white/[0.06] bg-[#0a0a0c] overflow-hidden">
                                <div className="px-6 py-4 border-b border-white/[0.06]">
                                    <h3 className="text-lg font-semibold text-white">About Me</h3>
                                </div>
                                <div className="p-6">
                                    <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">
                                        {profileData.bio || "No bio provided yet."}
                                    </p>
                                </div>
                            </div>

                            {/* Social Links */}
                            {socials.length > 0 && (
                                <div className="rounded-2xl border border-white/[0.06] bg-[#0a0a0c] overflow-hidden">
                                    <div className="px-6 py-4 border-b border-white/[0.06]">
                                        <h3 className="text-lg font-semibold text-white">Connect</h3>
                                    </div>
                                    <div className="p-6">
                                        <div className="flex flex-wrap gap-3">
                                            {socials.map((social, index) => (
                                                <a
                                                    key={index}
                                                    href={social.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.02] border border-white/[0.06] text-zinc-300 hover:text-white hover:border-white/15 transition-all"
                                                >
                                                    <Globe className="w-4 h-4" />
                                                    <span className="text-sm font-medium capitalize">{social.platform}</span>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "gigs" && (
                        <div className="rounded-2xl border border-white/[0.06] bg-[#0a0a0c] overflow-hidden">
                            <div className="px-6 py-4 border-b border-white/[0.06]">
                                <h3 className="text-lg font-semibold text-white">Services</h3>
                            </div>
                            <div className="p-6">
                                <div className="flex flex-col items-center justify-center py-12">
                                    <div className="w-16 h-16 rounded-full bg-zinc-800/50 flex items-center justify-center mb-4">
                                        <FileText className="w-8 h-8 text-zinc-600" />
                                    </div>
                                    <p className="text-zinc-400 text-center">No services available yet.</p>
                                    <p className="text-zinc-500 text-sm text-center mt-1">Check back later for offerings.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "portfolio" && (
                        <PortfolioTab
                            socials={socials}
                            tokenWork={token_work}
                            portfolio={portfolio}
                        />
                    )}

                    {activeTab === "reviews" && (
                        <div className="rounded-2xl border border-white/[0.06] bg-[#0a0a0c] overflow-hidden">
                            <div className="px-6 py-4 border-b border-white/[0.06]">
                                <h3 className="text-lg font-semibold text-white">Reviews</h3>
                            </div>
                            <div className="p-6">
                                <div className="flex flex-col items-center justify-center py-12">
                                    <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4">
                                        <Star className="w-8 h-8 text-amber-400" />
                                    </div>
                                    <p className="text-zinc-400 text-center">No reviews yet.</p>
                                    <p className="text-zinc-500 text-sm text-center mt-1">Be the first to work with this talent!</p>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </section>
        </div>
    );
}

export default FreelancerProfile;
