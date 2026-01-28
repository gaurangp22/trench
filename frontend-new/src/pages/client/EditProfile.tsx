import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/Button"
import {
    User, Camera, Save, Loader2, Plus, X, Globe, ExternalLink,
    Twitter, MessageCircle, MapPin, CheckCircle,
    Coins, Building2, Star, ChevronDown, TrendingUp, Briefcase
} from "lucide-react"
import { ProfileAPI, UploadAPI, ReviewAPI, type ProfileSocial, type TokenWorkItem, type Review } from "@/lib/api"
import { useAuth } from "@/context/AuthContext"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

const SOCIAL_PLATFORMS = [
    { id: 'website', label: 'Website', icon: Globe, placeholder: 'https://yourproject.com' },
    { id: 'twitter', label: 'Twitter', icon: Twitter, placeholder: 'https://twitter.com/username' },
    { id: 'telegram', label: 'Telegram', icon: MessageCircle, placeholder: 'https://t.me/username' },
    { id: 'discord', label: 'Discord', icon: MessageCircle, placeholder: 'username#0000 or server invite' },
]

const CHAIN_OPTIONS = [
    { value: 'solana', label: 'Solana' },
    { value: 'ethereum', label: 'Ethereum' },
    { value: 'base', label: 'Base' },
]

export function EditProfile() {
    const { user, profile: authProfile, refreshProfile } = useAuth()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [saveSuccess, setSaveSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [uploadingAvatar, setUploadingAvatar] = useState(false)
    const [profileExists, setProfileExists] = useState(false)

    // Profile data
    const [displayName, setDisplayName] = useState("")
    const [companyName, setCompanyName] = useState("")
    const [bio, setBio] = useState("")
    const [avatarUrl, setAvatarUrl] = useState("")
    const [country, setCountry] = useState("")

    // Socials
    const [socials, setSocials] = useState<Record<string, string>>({
        website: '',
        twitter: '',
        telegram: '',
        discord: '',
    })

    // Token Work (My Tokens/Projects)
    const [tokenWork, setTokenWork] = useState<TokenWorkItem[]>([])
    const [showAddToken, setShowAddToken] = useState(false)
    const [newTokenAddress, setNewTokenAddress] = useState("")
    const [newTokenChain, setNewTokenChain] = useState("solana")
    const [showChainDropdown, setShowChainDropdown] = useState(false)
    const [addingToken, setAddingToken] = useState(false)

    // Reviews (read-only)
    const [reviews, setReviews] = useState<Review[]>([])
    const [loadingReviews, setLoadingReviews] = useState(false)

    // Stats
    const [stats, setStats] = useState({
        totalJobsPosted: 0,
        totalSpent: 0,
        avgRating: 0,
        totalReviews: 0
    })

    useEffect(() => {
        loadProfile()
        loadReviews()
    }, [])

    // Use authProfile as fallback if available and no profile loaded yet
    // Note: Only populate fields, don't override profileExists as API response is authoritative
    useEffect(() => {
        if (authProfile && !loading && !displayName) {
            console.log("Using authProfile as fallback:", authProfile)
            setDisplayName(authProfile.display_name || "")
            setBio(authProfile.bio || "")
            setAvatarUrl(authProfile.avatar_url || "")
            setCountry(authProfile.country || "")
        }
    }, [authProfile, loading])

    const loadReviews = async () => {
        if (!user?.id) return

        setLoadingReviews(true)
        try {
            const data = await ReviewAPI.getByUser(user.id)
            setReviews(data.reviews || [])
        } catch (err) {
            console.error("Failed to load reviews:", err)
        } finally {
            setLoadingReviews(false)
        }
    }

    const loadProfile = async () => {
        try {
            setLoading(true)
            setError(null)
            const data = await ProfileAPI.getMyProfile()

            // Handle different response formats - profile might be nested or at root
            const p = data.profile || data

            console.log("Profile data loaded:", data)

            if (p && (p.display_name || p.id)) {
                setProfileExists(true)
                setDisplayName(p.display_name || "")
                setCompanyName((p as any).company_name || "")
                setBio(p.bio || (p as any).overview || "")
                setAvatarUrl(p.avatar_url || "")
                setCountry(p.country || "")
            }

            // Socials might be in data.socials or p.socials
            const socialsData = data.socials || (p as any).socials
            if (socialsData) {
                const socialMap: Record<string, string> = { website: '', twitter: '', telegram: '', discord: '' }
                socialsData.forEach((s: ProfileSocial) => {
                    if (s.platform && socialMap.hasOwnProperty(s.platform)) {
                        socialMap[s.platform] = s.url || ''
                    }
                })
                setSocials(socialMap)
            }

            // Token work might be in data.token_work or p.token_work
            const tokenWorkData = data.token_work || (p as any).token_work
            if (tokenWorkData) {
                setTokenWork(tokenWorkData)
            }

            // Stats from profile
            if (data.stats) {
                setStats({
                    totalJobsPosted: data.stats.jobs_completed || 0,
                    totalSpent: data.stats.total_earnings || 0,
                    avgRating: data.stats.rating || 0,
                    totalReviews: data.stats.review_count || 0
                })
            }
        } catch (err: any) {
            console.error("Failed to load profile:", err)
            console.error("Error details:", err.response?.data, err.response?.status)
            // 404 means no profile yet - that's OK for new users
            if (err.response?.status === 404) {
                console.log("No profile found - new user can create one")
                setProfileExists(false)
            } else if (err.response?.status === 401) {
                setError("Please log in to edit your profile")
            } else {
                setError(err.response?.data?.message || err.response?.data?.error || "Failed to load profile data. Please try again.")
            }
        } finally {
            setLoading(false)
        }
    }

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        if (!allowedTypes.includes(file.type)) {
            setError('Please upload a JPG, PNG, GIF, or WebP image')
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            setError('Image must be less than 5MB')
            return
        }

        setUploadingAvatar(true)
        setError(null)
        try {
            const result = await UploadAPI.uploadFile(file)
            setAvatarUrl(result.url)
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to upload image')
        } finally {
            setUploadingAvatar(false)
        }
    }

    // Token Work handlers
    const handleAddToken = async () => {
        if (!newTokenAddress.trim()) return

        setAddingToken(true)
        setError(null)
        try {
            console.log("Adding token:", { contract_address: newTokenAddress, chain: newTokenChain })
            const newToken = await ProfileAPI.addTokenWork({
                contract_address: newTokenAddress,
                chain: newTokenChain
            })
            console.log("Token added successfully:", newToken)
            setTokenWork([...tokenWork, (newToken as any).item || newToken])
            setNewTokenAddress("")
            setShowAddToken(false)
        } catch (err: any) {
            console.error("Failed to add token:", err.response?.data || err)
            const errorMsg = err.response?.data?.message
                || err.response?.data?.error
                || err.response?.data?.detail
                || (err.response?.status === 500 ? 'Server error - the backend failed to process this token. Check if the contract address is valid.' : null)
                || 'Failed to add token'
            setError(errorMsg)
        } finally {
            setAddingToken(false)
        }
    }

    const handleRemoveToken = async (tokenId: string) => {
        try {
            await ProfileAPI.deleteTokenWork(tokenId)
            setTokenWork(tokenWork.filter(t => t.id !== tokenId))
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to remove token')
        }
    }

    const handleSave = async () => {
        setSaving(true)
        setError(null)
        setSaveSuccess(false)

        const profileData = {
            display_name: displayName,
            company_name: companyName,
            overview: bio,
            avatar_url: avatarUrl,
            country: country || undefined,
        }

        try {
            // Always use PUT - backend handles upsert
            await ProfileAPI.update(profileData)
            setProfileExists(true)

            const socialsToSave = Object.entries(socials)
                .filter(([_, url]) => url.trim() !== '')
                .map(([platform, url]) => ({ platform: platform as 'website' | 'twitter' | 'telegram' | 'discord', url }))

            if (socialsToSave.length > 0) {
                await ProfileAPI.setSocials(socialsToSave)
            }

            if (refreshProfile) {
                await refreshProfile()
            }

            setSaveSuccess(true)
            setTimeout(() => setSaveSuccess(false), 3000)
        } catch (err: any) {
            console.error("Failed to save profile:", err)
            console.error("Save error details:", err.response?.data, err.response?.status)
            const errorMsg = err.response?.data?.message
                || err.response?.data?.error
                || err.response?.data?.detail
                || (err.response?.status === 400 ? "Invalid data. Please check your inputs." : null)
                || (err.response?.status === 401 ? "Please log in to save your profile." : null)
                || (err.response?.status === 500 ? "Server error. Please try again later." : null)
                || "Failed to save profile. Please try again."
            setError(errorMsg)
        } finally {
            setSaving(false)
        }
    }

    const formatMarketCap = (value: number | string | undefined) => {
        if (!value) return 'N/A'
        const num = typeof value === 'string' ? parseFloat(value) : value
        if (num >= 1e9) return `$${(num / 1e9).toFixed(1)}B`
        if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`
        if (num >= 1e3) return `$${(num / 1e3).toFixed(1)}K`
        return `$${num.toFixed(0)}`
    }

    const getDexScreenerUrl = (chain: string, contractAddress: string) => {
        return `https://dexscreener.com/${chain}/${contractAddress}`
    }

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }

    if (loading) {
        return (
            <DashboardLayout role="client">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mx-auto mb-4" />
                        <p className="text-zinc-400">Loading your profile...</p>
                    </div>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout role="client">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-4xl font-heading font-bold text-white mb-2 tracking-tight">Edit Profile</h1>
                    <p className="text-zinc-400 text-lg">Manage your client profile and showcase your projects.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className={cn(
                            "h-11 px-6 rounded-xl font-bold transition-all",
                            saveSuccess
                                ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                                : "bg-white text-black hover:bg-zinc-200"
                        )}
                    >
                        {saving ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : saveSuccess ? (
                            <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Saved!
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Save Changes
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Error Message */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center justify-between"
                    >
                        <span>{error}</span>
                        <button onClick={() => setError(null)} className="ml-4 hover:text-white">
                            <X className="w-4 h-4" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* New Profile Notice */}
            {!loading && !displayName && !companyName && !error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-300 text-sm flex items-center gap-3"
                >
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                        <strong>Create Your Profile</strong>
                        <p className="text-emerald-400/70 mt-0.5">Fill out the form below and click "Save Changes" to create your client profile.</p>
                    </div>
                </motion.div>
            )}

            <div className="space-y-8">
                {/* Basic Info Section */}
                <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl">
                    <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-emerald-400" />
                            Basic Information
                        </h2>
                    </div>
                    <div className="p-6">
                        <div className="grid lg:grid-cols-3 gap-8">
                            {/* Left: Avatar & Name */}
                            <div className="space-y-6">
                                {/* Avatar Upload */}
                                <div className="flex flex-col items-center">
                                    <div className="relative mb-4">
                                        {avatarUrl ? (
                                            <img
                                                src={avatarUrl}
                                                alt="Profile"
                                                className="w-32 h-32 rounded-2xl object-cover ring-4 ring-white/10"
                                            />
                                        ) : (
                                            <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center ring-4 ring-white/10">
                                                <Building2 className="w-14 h-14 text-white" />
                                            </div>
                                        )}
                                        <label className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-white flex items-center justify-center cursor-pointer hover:bg-zinc-200 transition-colors shadow-lg">
                                            {uploadingAvatar ? (
                                                <Loader2 className="w-5 h-5 text-zinc-600 animate-spin" />
                                            ) : (
                                                <Camera className="w-5 h-5 text-zinc-600" />
                                            )}
                                            <input
                                                type="file"
                                                accept="image/jpeg,image/png,image/gif,image/webp"
                                                onChange={handleAvatarUpload}
                                                className="hidden"
                                                disabled={uploadingAvatar}
                                            />
                                        </label>
                                    </div>
                                    <p className="text-xs text-zinc-500 text-center">JPG, PNG, GIF or WebP. Max 5MB.</p>
                                </div>

                                {/* Display Name */}
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-2">Display Name</label>
                                    <input
                                        type="text"
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        placeholder="Your name or alias"
                                        className="w-full h-12 px-4 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                    />
                                </div>

                                {/* Company/Project Name */}
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-2">Company / Project Name</label>
                                    <input
                                        type="text"
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        placeholder="e.g., My Awesome Project"
                                        className="w-full h-12 px-4 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Right: Bio & Location */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Bio */}
                                <div>
                                    <label className="flex items-center justify-between text-sm font-medium text-zinc-300 mb-2">
                                        <span>About / Bio</span>
                                        <span className="text-xs text-zinc-500">{bio.length}/1000</span>
                                    </label>
                                    <textarea
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value.slice(0, 1000))}
                                        placeholder="Tell freelancers about yourself, your company, or your project..."
                                        rows={6}
                                        className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 resize-none transition-all"
                                    />
                                </div>

                                {/* Location */}
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                                        <MapPin className="w-4 h-4 inline mr-1" />
                                        Location
                                    </label>
                                    <input
                                        type="text"
                                        value={country}
                                        onChange={(e) => setCountry(e.target.value)}
                                        placeholder="e.g., United States, Remote"
                                        className="w-full h-12 px-4 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                    />
                                </div>

                                {/* Stats Preview */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/[0.06]">
                                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                                        <div className="flex items-center gap-2 text-zinc-500 text-xs mb-1">
                                            <Briefcase className="w-3.5 h-3.5" />
                                            Jobs Posted
                                        </div>
                                        <div className="text-xl font-bold text-white">{stats.totalJobsPosted}</div>
                                    </div>
                                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                                        <div className="flex items-center gap-2 text-zinc-500 text-xs mb-1">
                                            <Coins className="w-3.5 h-3.5" />
                                            Total Spent
                                        </div>
                                        <div className="text-xl font-bold text-emerald-400">◎{stats.totalSpent.toFixed(1)}</div>
                                    </div>
                                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                                        <div className="flex items-center gap-2 text-zinc-500 text-xs mb-1">
                                            <Star className="w-3.5 h-3.5" />
                                            Avg Rating
                                        </div>
                                        <div className="text-xl font-bold text-amber-400">{stats.avgRating.toFixed(1)}</div>
                                    </div>
                                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                                        <div className="flex items-center gap-2 text-zinc-500 text-xs mb-1">
                                            <MessageCircle className="w-3.5 h-3.5" />
                                            Reviews
                                        </div>
                                        <div className="text-xl font-bold text-white">{stats.totalReviews}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* My Tokens Section */}
                <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl">
                    <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Coins className="w-5 h-5 text-amber-400" />
                            My Tokens / Projects
                            <span className="text-xs text-zinc-500 font-normal ml-2">Showcase tokens you've launched</span>
                        </h2>
                        <Button
                            onClick={() => setShowAddToken(true)}
                            size="sm"
                            disabled={!profileExists}
                            className={cn(
                                "bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20",
                                !profileExists && "opacity-50 cursor-not-allowed"
                            )}
                            title={!profileExists ? "Save your profile first" : undefined}
                        >
                            <Plus className="w-4 h-4 mr-1" />
                            Add Token
                        </Button>
                    </div>
                    <div className="p-6">
                        {!profileExists ? (
                            <div className="text-center py-8">
                                <Coins className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                                <p className="text-zinc-400 mb-2">Save your profile first</p>
                                <p className="text-sm text-zinc-500">You need to save your basic profile information before adding tokens.</p>
                            </div>
                        ) : tokenWork.length === 0 && !showAddToken ? (
                            <div className="text-center py-8">
                                <Coins className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                                <p className="text-zinc-400 mb-2">No tokens added yet</p>
                                <p className="text-sm text-zinc-500 mb-4">Showcase tokens or projects you've launched to build credibility</p>
                                <Button
                                    onClick={() => setShowAddToken(true)}
                                    variant="outline"
                                    className="border-amber-500/20 text-amber-400 hover:bg-amber-500/10"
                                >
                                    <Plus className="w-4 h-4 mr-1" />
                                    Add Your First Token
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Add Token Form */}
                                <AnimatePresence>
                                    {showAddToken && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl"
                                        >
                                            <div className="grid sm:grid-cols-3 gap-4">
                                                <div className="sm:col-span-2">
                                                    <label className="block text-sm font-medium text-zinc-300 mb-2">Contract Address</label>
                                                    <input
                                                        type="text"
                                                        value={newTokenAddress}
                                                        onChange={(e) => setNewTokenAddress(e.target.value)}
                                                        placeholder="Enter token contract address..."
                                                        className="w-full h-11 px-4 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500/50 text-sm"
                                                    />
                                                </div>
                                                <div className="relative">
                                                    <label className="block text-sm font-medium text-zinc-300 mb-2">Chain</label>
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowChainDropdown(!showChainDropdown)}
                                                        onBlur={() => setTimeout(() => setShowChainDropdown(false), 200)}
                                                        className="w-full h-11 px-4 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:border-amber-500/50 text-sm flex items-center justify-between"
                                                    >
                                                        <span>{CHAIN_OPTIONS.find(c => c.value === newTokenChain)?.label || 'Select Chain'}</span>
                                                        <ChevronDown className={cn("w-4 h-4 text-zinc-400 transition-transform", showChainDropdown && "rotate-180")} />
                                                    </button>
                                                    {showChainDropdown && (
                                                        <div className="absolute top-full left-0 right-0 mt-2 bg-[#121214] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
                                                            {CHAIN_OPTIONS.map((option) => (
                                                                <button
                                                                    key={option.value}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setNewTokenChain(option.value)
                                                                        setShowChainDropdown(false)
                                                                    }}
                                                                    className={cn(
                                                                        "w-full px-4 py-2.5 text-left text-sm transition-colors",
                                                                        newTokenChain === option.value
                                                                            ? "bg-amber-500/20 text-amber-300"
                                                                            : "text-zinc-300 hover:bg-amber-500/10 hover:text-amber-300"
                                                                    )}
                                                                >
                                                                    {option.label}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex justify-end gap-2 mt-4">
                                                <Button
                                                    onClick={() => { setShowAddToken(false); setNewTokenAddress("") }}
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-zinc-400"
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    onClick={handleAddToken}
                                                    disabled={addingToken || !newTokenAddress.trim()}
                                                    size="sm"
                                                    className="bg-amber-500 hover:bg-amber-600 text-black"
                                                >
                                                    {addingToken ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Token'}
                                                </Button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Token List */}
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {tokenWork.map((token) => (
                                        <div
                                            key={token.id}
                                            className="group relative p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl hover:border-amber-500/30 transition-all"
                                        >
                                            <button
                                                onClick={() => handleRemoveToken(token.id)}
                                                className="absolute top-2 right-2 w-6 h-6 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                            <a
                                                href={getDexScreenerUrl(token.chain, token.contract_address)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block"
                                            >
                                                <div className="flex items-center gap-3">
                                                    {token.token_image_url ? (
                                                        <img src={token.token_image_url} alt={token.token_name || ''} className="w-10 h-10 rounded-full" />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                                                            <Coins className="w-5 h-5 text-amber-400" />
                                                        </div>
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-medium text-white truncate flex items-center gap-1.5">
                                                            {token.token_name || 'Unknown Token'}
                                                            <ExternalLink className="w-3 h-3 text-zinc-500 group-hover:text-amber-400 transition-colors" />
                                                        </div>
                                                        <div className="text-xs text-zinc-500">
                                                            {token.token_symbol ? `$${token.token_symbol}` : ''}
                                                            {token.token_symbol && ' · '}
                                                            {token.chain}
                                                        </div>
                                                    </div>
                                                </div>
                                                {token.ath_market_cap && (
                                                    <div className="mt-3 pt-3 border-t border-white/[0.06]">
                                                        <div className="flex justify-between text-xs mb-1">
                                                            <span className="text-zinc-500">ATH Market Cap</span>
                                                            <span className="text-emerald-400 font-medium">{formatMarketCap(token.ath_market_cap)}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1 text-emerald-400 text-xs">
                                                            <TrendingUp className="w-3 h-3" />
                                                            <span>All Time High</span>
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="mt-2 text-[10px] text-zinc-600 truncate font-mono">
                                                    {token.contract_address.slice(0, 8)}...{token.contract_address.slice(-6)}
                                                </div>
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Social Links Section */}
                <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl">
                    <div className="px-6 py-4 border-b border-white/[0.06]">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Globe className="w-5 h-5 text-cyan-400" />
                            Social Links
                        </h2>
                    </div>
                    <div className="p-6">
                        <div className="grid sm:grid-cols-2 gap-4">
                            {SOCIAL_PLATFORMS.map((platform) => {
                                const Icon = platform.icon
                                return (
                                    <div key={platform.id}>
                                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                                            <Icon className="w-4 h-4 inline mr-1.5" />
                                            {platform.label}
                                        </label>
                                        <input
                                            type="text"
                                            value={socials[platform.id] || ''}
                                            onChange={(e) => setSocials({ ...socials, [platform.id]: e.target.value })}
                                            placeholder={platform.placeholder}
                                            className="w-full h-11 px-4 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500/50 text-sm"
                                        />
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* Reviews Section (Read-only) */}
                <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl">
                    <div className="px-6 py-4 border-b border-white/[0.06]">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Star className="w-5 h-5 text-amber-400" />
                            Reviews from Freelancers
                            <span className="text-xs text-zinc-500 font-normal ml-2">What freelancers say about working with you</span>
                        </h2>
                    </div>
                    <div className="p-6">
                        {loadingReviews ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
                            </div>
                        ) : reviews.length === 0 ? (
                            <div className="text-center py-8">
                                <Star className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                                <p className="text-zinc-400 mb-2">No reviews yet</p>
                                <p className="text-sm text-zinc-500">Complete contracts with freelancers to receive reviews</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {reviews.map((review) => (
                                    <div
                                        key={review.id}
                                        className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                                    <User className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-white">
                                                        {review.reviewer_username || 'Anonymous'}
                                                    </div>
                                                    <div className="text-xs text-zinc-500">
                                                        {formatDate(review.created_at)}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={cn(
                                                            "w-4 h-4",
                                                            i < review.overall_rating
                                                                ? "text-amber-400 fill-amber-400"
                                                                : "text-zinc-600"
                                                        )}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        {review.review_text && (
                                            <p className="text-sm text-zinc-300 leading-relaxed">
                                                "{review.review_text}"
                                            </p>
                                        )}
                                        {(review.communication_rating || review.professionalism_rating) && (
                                            <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-white/[0.06]">
                                                {review.communication_rating && (
                                                    <div className="text-xs">
                                                        <span className="text-zinc-500">Communication:</span>
                                                        <span className="text-amber-400 ml-1">{review.communication_rating}/5</span>
                                                    </div>
                                                )}
                                                {review.professionalism_rating && (
                                                    <div className="text-xs">
                                                        <span className="text-zinc-500">Professionalism:</span>
                                                        <span className="text-amber-400 ml-1">{review.professionalism_rating}/5</span>
                                                    </div>
                                                )}
                                                {review.would_recommend !== undefined && (
                                                    <div className="text-xs">
                                                        <span className="text-zinc-500">Would recommend:</span>
                                                        <span className={cn("ml-1", review.would_recommend ? "text-emerald-400" : "text-red-400")}>
                                                            {review.would_recommend ? 'Yes' : 'No'}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom Save Button */}
                <div className="flex justify-end gap-3 pt-4">
                    <Link to="/client/dashboard">
                        <Button variant="outline" className="h-12 px-8 rounded-xl border-white/10 text-zinc-300 hover:bg-white/[0.03]">
                            Cancel
                        </Button>
                    </Link>
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className={cn(
                            "h-12 px-8 rounded-xl font-bold transition-all",
                            saveSuccess
                                ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                                : "bg-white text-black hover:bg-zinc-200"
                        )}
                    >
                        {saving ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : saveSuccess ? (
                            <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Saved!
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Save All Changes
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </DashboardLayout>
    )
}
