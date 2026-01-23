import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
    Star, MapPin, Calendar, ShieldCheck, Briefcase,
    MessageSquare, ChevronLeft, User, FileText, Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfileAPI, type ProfileResponse, type ProfileSocial, type TokenWorkItem, type PortfolioItem } from "@/lib/api";
import { PortfolioTab } from "@/components/portfolio/PortfolioTab";

type TabType = "profile" | "gigs" | "portfolio" | "reviews";

const TABS: { id: TabType; label: string; icon: React.ElementType }[] = [
    { id: "profile", label: "Profile", icon: User },
    { id: "gigs", label: "Gigs", icon: Briefcase },
    { id: "portfolio", label: "Portfolio", icon: Award },
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
            <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-12">
                <div className="container max-w-5xl mx-auto px-6">
                    <div className="flex items-center justify-center py-20">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-500 border-r-transparent" />
                    </div>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-12">
                <div className="container max-w-5xl mx-auto px-6">
                    <div className="text-center py-20">
                        <h2 className="text-2xl font-bold text-white mb-4">Profile Not Found</h2>
                        <p className="text-zinc-400 mb-6">{error || "The profile you're looking for doesn't exist."}</p>
                        <Link to="/talent">
                            <Button>
                                <ChevronLeft className="w-4 h-4 mr-2" />
                                Back to Talent
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const { profile: profileData, skills = [], socials = [], token_work = [], portfolio = [] } = profile;

    return (
        <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-12">
            <div className="container max-w-5xl mx-auto px-6">
                {/* Back Button */}
                <Link
                    to="/talent"
                    className="inline-flex items-center text-zinc-400 hover:text-white mb-6 transition-colors"
                >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back to Talent
                </Link>

                {/* Profile Header */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-6">
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Avatar */}
                        <div className="relative">
                            {profileData.avatar_url ? (
                                <img
                                    src={profileData.avatar_url}
                                    alt={profileData.display_name}
                                    className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover ring-4 ring-zinc-800"
                                />
                            ) : (
                                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl font-bold ring-4 ring-zinc-800">
                                    {profileData.display_name?.charAt(0) || "?"}
                                </div>
                            )}
                            {profileData.available_for_hire && (
                                <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-2 border-zinc-900 rounded-full" />
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <h1 className="text-2xl md:text-3xl font-bold text-white">
                                    {profileData.display_name || "Anonymous"}
                                </h1>
                                <ShieldCheck className="w-5 h-5 text-blue-400" />
                            </div>

                            {profileData.professional_title && (
                                <p className="text-lg text-zinc-300 mb-3">
                                    {profileData.professional_title}
                                </p>
                            )}

                            <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400 mb-4">
                                <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                    <span>5.0</span>
                                    <span className="text-zinc-500">(0 reviews)</span>
                                </div>
                                {profileData.country && (
                                    <div className="flex items-center gap-1">
                                        <MapPin className="w-4 h-4" />
                                        <span>{profileData.country}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    <span>Joined {new Date(profileData.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                                </div>
                            </div>

                            {/* Skills */}
                            {skills.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {skills.slice(0, 5).map((skill: { id: string; name: string }) => (
                                        <span
                                            key={skill.id}
                                            className="px-3 py-1 bg-zinc-800/50 text-zinc-300 text-sm rounded-lg border border-zinc-700"
                                        >
                                            {skill.name}
                                        </span>
                                    ))}
                                    {skills.length > 5 && (
                                        <span className="px-3 py-1 text-zinc-500 text-sm">
                                            +{skills.length - 5} more
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-3">
                            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Contact
                            </Button>
                            {profileData.hourly_rate_sol && (
                                <div className="text-center px-4 py-2 bg-zinc-800/50 rounded-lg border border-zinc-700">
                                    <span className="text-2xl font-bold text-white">{profileData.hourly_rate_sol}</span>
                                    <span className="text-zinc-400 text-sm ml-1">SOL/hr</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-2 mb-6">
                    <div className="flex gap-2 overflow-x-auto no-scrollbar">
                        {TABS.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab.id
                                        ? "bg-green-500 text-black"
                                        : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Tab Content */}
                <div>
                    {activeTab === "profile" && (
                        <div className="space-y-6">
                            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">About Me</h3>
                                <p className="text-zinc-300 whitespace-pre-wrap">
                                    {profileData.bio || "No bio provided yet."}
                                </p>
                            </div>
                        </div>
                    )}

                    {activeTab === "gigs" && (
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                            <div className="text-center py-8">
                                <FileText className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                                <p className="text-zinc-400">No gigs available yet.</p>
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
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                            <div className="text-center py-8">
                                <Star className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                                <p className="text-zinc-400">No reviews yet.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default FreelancerProfile;
