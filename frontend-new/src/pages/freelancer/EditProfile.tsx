import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/Button"
import {
    User, Camera, Save, Loader2, Plus, X, Globe, ExternalLink,
    Twitter, MessageCircle, Sparkles, MapPin, Clock, CheckCircle,
    Coins, Image, Trash2, Edit3, Link2, ChevronDown
} from "lucide-react"
import { ProfileAPI, UploadAPI, SkillsAPI, type ProfileSocial, type TokenWorkItem, type PortfolioItem } from "@/lib/api"
import { useAuth } from "@/context/AuthContext"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

const SOCIAL_PLATFORMS = [
    { id: 'website', label: 'Website', icon: Globe, placeholder: 'https://yoursite.com' },
    { id: 'twitter', label: 'Twitter', icon: Twitter, placeholder: 'https://twitter.com/username' },
    { id: 'telegram', label: 'Telegram', icon: MessageCircle, placeholder: 'https://t.me/username' },
    { id: 'discord', label: 'Discord', icon: MessageCircle, placeholder: 'username#0000 or server invite' },
]

const AVAILABILITY_OPTIONS = [
    { value: 'available', label: 'Available', description: 'Actively looking for work' },
    { value: 'busy', label: 'Limited', description: 'Taking on select projects' },
    { value: 'not_available', label: 'Not Available', description: 'Not accepting new work' },
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
    const [_activeSection, _setActiveSection] = useState<string | null>(null)
    const [profileExists, setProfileExists] = useState(false)

    // Profile data
    const [displayName, setDisplayName] = useState("")
    const [professionalTitle, setProfessionalTitle] = useState("")
    const [bio, setBio] = useState("")
    const [avatarUrl, setAvatarUrl] = useState("")
    const [hourlyRate, setHourlyRate] = useState("")
    const [country, setCountry] = useState("")
    const [availabilityStatus, setAvailabilityStatus] = useState("available")
    const [availableForHire, setAvailableForHire] = useState(true)

    // Skills
    const [skills, setSkills] = useState<{ id: string; name: string }[]>([])
    const [availableSkills, setAvailableSkills] = useState<{ id: number; name: string }[]>([])
    const [skillSearch, setSkillSearch] = useState("")
    const [showSkillDropdown, setShowSkillDropdown] = useState(false)

    // Socials
    const [socials, setSocials] = useState<Record<string, string>>({
        website: '',
        twitter: '',
        telegram: '',
        discord: '',
    })

    // Token Work (My Work)
    const [tokenWork, setTokenWork] = useState<TokenWorkItem[]>([])
    const [showAddToken, setShowAddToken] = useState(false)
    const [newTokenAddress, setNewTokenAddress] = useState("")
    const [newTokenChain, setNewTokenChain] = useState("solana")
    const [showChainDropdown, setShowChainDropdown] = useState(false)
    const [addingToken, setAddingToken] = useState(false)

    // Portfolio
    const [portfolio, setPortfolio] = useState<PortfolioItem[]>([])
    const [showAddPortfolio, setShowAddPortfolio] = useState(false)
    const [editingPortfolio, setEditingPortfolio] = useState<PortfolioItem | null>(null)
    const [portfolioForm, setPortfolioForm] = useState({
        title: '',
        description: '',
        project_url: '',
        image_url: ''
    })
    const [uploadingPortfolioImage, setUploadingPortfolioImage] = useState(false)
    const [savingPortfolio, setSavingPortfolio] = useState(false)

    useEffect(() => {
        loadProfile()
        loadAvailableSkills()
    }, [])

    // Use authProfile as fallback if available and no profile loaded yet
    // Note: Only populate fields, don't override profileExists as API response is authoritative
    useEffect(() => {
        if (authProfile && !loading && !displayName) {
            console.log("Using authProfile as fallback:", authProfile)
            setDisplayName(authProfile.display_name || "")
            setProfessionalTitle(authProfile.professional_title || "")
            setBio(authProfile.bio || authProfile.overview || "")
            setAvatarUrl(authProfile.avatar_url || "")
            setHourlyRate(authProfile.hourly_rate_sol?.toString() || "")
            setCountry(authProfile.country || "")
            setAvailabilityStatus(authProfile.availability_status || "available")
            setAvailableForHire(authProfile.available_for_hire !== false)
        }
    }, [authProfile, loading])

    const loadAvailableSkills = async () => {
        try {
            const data = await SkillsAPI.list()
            setAvailableSkills(data.skills || [])
        } catch (err) {
            console.error("Failed to load skills:", err)
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

            if (p && (p.display_name || p.professional_title || p.id)) {
                setProfileExists(true)
                setDisplayName(p.display_name || "")
                setProfessionalTitle(p.professional_title || "")
                setBio(p.bio || p.overview || "")
                setAvatarUrl(p.avatar_url || "")
                setHourlyRate(p.hourly_rate_sol?.toString() || "")
                setCountry(p.country || "")
                setAvailabilityStatus(p.availability_status || "available")
                setAvailableForHire(p.available_for_hire !== false)
            }

            // Skills might be in data.skills or p.skills
            const skills = data.skills || p.skills
            if (skills) {
                setSkills(skills.map((s: any) => ({ id: s.id?.toString() || s.skill_id?.toString(), name: s.name })))
            }

            // Socials might be in data.socials or p.socials
            const socials = data.socials || p.socials
            if (socials) {
                const socialMap: Record<string, string> = { website: '', twitter: '', telegram: '', discord: '' }
                socials.forEach((s: ProfileSocial) => {
                    if (s.platform && socialMap.hasOwnProperty(s.platform)) {
                        socialMap[s.platform] = s.url || ''
                    }
                })
                setSocials(socialMap)
            }

            // Token work might be in data.token_work or p.token_work
            const tokenWorkData = data.token_work || p.token_work
            if (tokenWorkData) {
                setTokenWork(tokenWorkData)
            }

            // Portfolio might be in data.portfolio or p.portfolio
            const portfolioData = data.portfolio || p.portfolio
            if (portfolioData) {
                setPortfolio(portfolioData)
            }
        } catch (err: any) {
            console.error("Failed to load profile:", err)
            console.error("Error details:", err.response?.data, err.response?.status)
            // 404 means no profile yet - that's OK for new users
            if (err.response?.status === 404) {
                // New user - they can create their profile
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

    const handleAddSkill = (skill: { id: number; name: string }) => {
        if (!skills.find(s => s.id === skill.id.toString())) {
            setSkills([...skills, { id: skill.id.toString(), name: skill.name }])
        }
        setSkillSearch("")
        setShowSkillDropdown(false)
    }

    const handleRemoveSkill = (skillId: string) => {
        setSkills(skills.filter(s => s.id !== skillId))
    }

    const filteredSkills = availableSkills.filter(
        s => s.name.toLowerCase().includes(skillSearch.toLowerCase()) &&
            !skills.find(existing => existing.id === s.id.toString())
    )

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

    // Portfolio handlers
    const handlePortfolioImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

        setUploadingPortfolioImage(true)
        try {
            const result = await UploadAPI.uploadFile(file)
            setPortfolioForm({ ...portfolioForm, image_url: result.url })
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to upload image')
        } finally {
            setUploadingPortfolioImage(false)
        }
    }

    const handleSavePortfolioItem = async () => {
        if (!portfolioForm.title.trim()) {
            setError('Please enter a title for your portfolio item')
            return
        }

        setSavingPortfolio(true)
        try {
            if (editingPortfolio) {
                const updated = await ProfileAPI.updatePortfolioItem(editingPortfolio.id, {
                    title: portfolioForm.title,
                    description: portfolioForm.description,
                    project_url: portfolioForm.project_url,
                    image_urls: portfolioForm.image_url ? [portfolioForm.image_url] : []
                })
                setPortfolio(portfolio.map(p => p.id === editingPortfolio.id ? updated : p))
            } else {
                const newItem = await ProfileAPI.addPortfolioItem({
                    title: portfolioForm.title,
                    description: portfolioForm.description,
                    project_url: portfolioForm.project_url,
                    image_urls: portfolioForm.image_url ? [portfolioForm.image_url] : [],
                    sort_order: portfolio.length
                })
                setPortfolio([...portfolio, newItem])
            }
            resetPortfolioForm()
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to save portfolio item')
        } finally {
            setSavingPortfolio(false)
        }
    }

    const handleEditPortfolio = (item: PortfolioItem) => {
        setEditingPortfolio(item)
        setPortfolioForm({
            title: item.title || '',
            description: item.description || '',
            project_url: item.project_url || '',
            image_url: item.image_urls?.[0] || item.image_url || ''
        })
        setShowAddPortfolio(true)
    }

    const handleDeletePortfolio = async (itemId: string) => {
        if (!confirm('Are you sure you want to delete this portfolio item?')) return

        try {
            await ProfileAPI.deletePortfolioItem(itemId)
            setPortfolio(portfolio.filter(p => p.id !== itemId))
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to delete portfolio item')
        }
    }

    const resetPortfolioForm = () => {
        setPortfolioForm({ title: '', description: '', project_url: '', image_url: '' })
        setEditingPortfolio(null)
        setShowAddPortfolio(false)
    }

    const handleSave = async () => {
        setSaving(true)
        setError(null)
        setSaveSuccess(false)

        const profileData = {
            display_name: displayName,
            professional_title: professionalTitle,
            overview: bio,
            avatar_url: avatarUrl,
            hourly_rate_sol: hourlyRate ? parseFloat(hourlyRate) : undefined,
            country: country || undefined,
            availability_status: availabilityStatus,
            available_for_hire: availableForHire,
        }

        try {
            // Always use PUT - backend handles upsert
            await ProfileAPI.update(profileData)
            setProfileExists(true)

            if (skills.length > 0) {
                await ProfileAPI.setSkills(skills.map(s => s.id))
            }

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

    if (loading) {
        return (
            <DashboardLayout role="freelancer">
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
        <DashboardLayout role="freelancer">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-4xl font-heading font-bold text-white mb-2 tracking-tight">Edit Profile</h1>
                    <p className="text-zinc-400 text-lg">Update your profile to attract more clients.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link to={`/freelancer/${user?.id}`}>
                        <Button variant="outline" className="h-11 px-6 rounded-xl border-white/10 text-zinc-300 hover:bg-white/[0.03]">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View Public Profile
                        </Button>
                    </Link>
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
            {!loading && !displayName && !professionalTitle && !error && (
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
                        <p className="text-emerald-400/70 mt-0.5">Fill out the form below and click "Save Changes" to create your profile.</p>
                    </div>
                </motion.div>
            )}

            <div className="space-y-8">
                {/* Basic Info Section */}
                <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl">
                    <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <User className="w-5 h-5 text-emerald-400" />
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
                                                <User className="w-14 h-14 text-white" />
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

                                {/* Professional Title */}
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-2">Professional Title</label>
                                    <input
                                        type="text"
                                        value={professionalTitle}
                                        onChange={(e) => setProfessionalTitle(e.target.value)}
                                        placeholder="e.g., Senior Solana Developer"
                                        className="w-full h-12 px-4 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Right: Bio & Location */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Bio */}
                                <div>
                                    <label className="flex items-center justify-between text-sm font-medium text-zinc-300 mb-2">
                                        <span>Bio / Overview</span>
                                        <span className="text-xs text-zinc-500">{bio.length}/1000</span>
                                    </label>
                                    <textarea
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value.slice(0, 1000))}
                                        placeholder="Tell clients about your experience, skills, and what makes you unique..."
                                        rows={6}
                                        className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 resize-none transition-all"
                                    />
                                </div>

                                <div className="grid sm:grid-cols-2 gap-6">
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

                                    {/* Hourly Rate */}
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                                            <Sparkles className="w-4 h-4 inline mr-1" />
                                            Hourly Rate (SOL)
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400 font-medium">◎</span>
                                            <input
                                                type="number"
                                                value={hourlyRate}
                                                onChange={(e) => setHourlyRate(e.target.value)}
                                                placeholder="0"
                                                min="0"
                                                step="0.1"
                                                className="w-full h-12 pl-10 pr-4 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Skills Section */}
                <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl">
                    <div className="px-6 py-4 border-b border-white/[0.06]">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-purple-400" />
                            Skills
                        </h2>
                    </div>
                    <div className="p-6">
                        <div className="flex flex-wrap gap-2 mb-4">
                            {skills.map((skill) => (
                                <span
                                    key={skill.id}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-300 text-sm group"
                                >
                                    {skill.name}
                                    <button
                                        onClick={() => handleRemoveSkill(skill.id)}
                                        className="w-4 h-4 rounded-full bg-emerald-500/20 hover:bg-red-500/30 flex items-center justify-center transition-colors opacity-50 group-hover:opacity-100"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                            {skills.length === 0 && (
                                <span className="text-sm text-zinc-500">No skills added yet. Add skills to appear in search results.</span>
                            )}
                        </div>

                        <div className="relative max-w-md">
                            <input
                                type="text"
                                value={skillSearch}
                                onChange={(e) => {
                                    setSkillSearch(e.target.value)
                                    setShowSkillDropdown(true)
                                }}
                                onFocus={() => setShowSkillDropdown(true)}
                                onBlur={() => setTimeout(() => setShowSkillDropdown(false), 200)}
                                placeholder="Search and add skills..."
                                className="w-full h-12 px-4 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                            />
                            {showSkillDropdown && filteredSkills.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-[#121214] border border-white/10 rounded-xl shadow-2xl max-h-48 overflow-y-auto z-50">
                                    {filteredSkills.slice(0, 10).map((skill) => (
                                        <button
                                            key={skill.id}
                                            onClick={() => handleAddSkill(skill)}
                                            className="w-full px-4 py-2.5 text-left text-sm text-zinc-300 hover:bg-emerald-500/20 hover:text-emerald-300 transition-colors first:rounded-t-xl last:rounded-b-xl"
                                        >
                                            {skill.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* My Work (Token Work) Section */}
                <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl">
                    <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Coins className="w-5 h-5 text-amber-400" />
                            My Work (Tokens/Projects)
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
                                <p className="text-sm text-zinc-500 mb-4">Showcase tokens or projects you've worked on to build credibility</p>
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
                                                    <div className="mt-3 pt-3 border-t border-white/[0.06] flex justify-between text-xs">
                                                        <span className="text-zinc-500">ATH Market Cap</span>
                                                        <span className="text-emerald-400 font-medium">{formatMarketCap(token.ath_market_cap)}</span>
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

                {/* Portfolio Section */}
                <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl">
                    <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Image className="w-5 h-5 text-blue-400" />
                            Portfolio / Gallery
                        </h2>
                        <Button
                            onClick={() => setShowAddPortfolio(true)}
                            size="sm"
                            disabled={!profileExists}
                            className={cn(
                                "bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20",
                                !profileExists && "opacity-50 cursor-not-allowed"
                            )}
                            title={!profileExists ? "Save your profile first" : undefined}
                        >
                            <Plus className="w-4 h-4 mr-1" />
                            Add Project
                        </Button>
                    </div>
                    <div className="p-6">
                        {!profileExists ? (
                            <div className="text-center py-8">
                                <Image className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                                <p className="text-zinc-400 mb-2">Save your profile first</p>
                                <p className="text-sm text-zinc-500">You need to save your basic profile information before adding portfolio items.</p>
                            </div>
                        ) : portfolio.length === 0 && !showAddPortfolio ? (
                            <div className="text-center py-8">
                                <Image className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                                <p className="text-zinc-400 mb-2">No portfolio items yet</p>
                                <p className="text-sm text-zinc-500 mb-4">Add projects to showcase your work to potential clients</p>
                                <Button
                                    onClick={() => setShowAddPortfolio(true)}
                                    variant="outline"
                                    className="border-blue-500/20 text-blue-400 hover:bg-blue-500/10"
                                >
                                    <Plus className="w-4 h-4 mr-1" />
                                    Add Your First Project
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Add/Edit Portfolio Form */}
                                <AnimatePresence>
                                    {showAddPortfolio && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl"
                                        >
                                            <h3 className="text-sm font-medium text-white mb-4">
                                                {editingPortfolio ? 'Edit Project' : 'Add New Project'}
                                            </h3>
                                            <div className="grid sm:grid-cols-2 gap-4">
                                                <div className="sm:col-span-2">
                                                    <label className="block text-sm font-medium text-zinc-300 mb-2">Project Title *</label>
                                                    <input
                                                        type="text"
                                                        value={portfolioForm.title}
                                                        onChange={(e) => setPortfolioForm({ ...portfolioForm, title: e.target.value })}
                                                        placeholder="e.g., DeFi Dashboard Redesign"
                                                        className="w-full h-11 px-4 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500/50 text-sm"
                                                    />
                                                </div>
                                                <div className="sm:col-span-2">
                                                    <label className="block text-sm font-medium text-zinc-300 mb-2">Description</label>
                                                    <textarea
                                                        value={portfolioForm.description}
                                                        onChange={(e) => setPortfolioForm({ ...portfolioForm, description: e.target.value })}
                                                        placeholder="Describe the project and your role..."
                                                        rows={3}
                                                        className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500/50 resize-none text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-zinc-300 mb-2">Project URL</label>
                                                    <input
                                                        type="url"
                                                        value={portfolioForm.project_url}
                                                        onChange={(e) => setPortfolioForm({ ...portfolioForm, project_url: e.target.value })}
                                                        placeholder="https://..."
                                                        className="w-full h-11 px-4 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500/50 text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-zinc-300 mb-2">Project Image</label>
                                                    <div className="flex items-center gap-3">
                                                        {portfolioForm.image_url ? (
                                                            <img src={portfolioForm.image_url} alt="Preview" className="w-11 h-11 rounded-lg object-cover" />
                                                        ) : (
                                                            <div className="w-11 h-11 rounded-lg bg-white/[0.05] flex items-center justify-center">
                                                                <Image className="w-5 h-5 text-zinc-500" />
                                                            </div>
                                                        )}
                                                        <label className="flex-1 h-11 px-4 bg-white/[0.03] border border-white/[0.08] rounded-xl flex items-center justify-center cursor-pointer hover:border-white/15 transition-colors">
                                                            {uploadingPortfolioImage ? (
                                                                <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
                                                            ) : (
                                                                <span className="text-sm text-zinc-400">Upload Image</span>
                                                            )}
                                                            <input
                                                                type="file"
                                                                accept="image/jpeg,image/png,image/gif,image/webp"
                                                                onChange={handlePortfolioImageUpload}
                                                                className="hidden"
                                                                disabled={uploadingPortfolioImage}
                                                            />
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex justify-end gap-2 mt-4">
                                                <Button onClick={resetPortfolioForm} variant="ghost" size="sm" className="text-zinc-400">
                                                    Cancel
                                                </Button>
                                                <Button
                                                    onClick={handleSavePortfolioItem}
                                                    disabled={savingPortfolio || !portfolioForm.title.trim()}
                                                    size="sm"
                                                    className="bg-blue-500 hover:bg-blue-600 text-white"
                                                >
                                                    {savingPortfolio ? <Loader2 className="w-4 h-4 animate-spin" /> : editingPortfolio ? 'Update' : 'Add Project'}
                                                </Button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Portfolio Grid */}
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {portfolio.map((item) => (
                                        <div
                                            key={item.id}
                                            className="group relative bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden hover:border-white/15 transition-all"
                                        >
                                            {/* Image */}
                                            <div className="aspect-video bg-zinc-800 relative overflow-hidden">
                                                {(item.image_urls?.[0] || item.image_url) ? (
                                                    <img
                                                        src={item.image_urls?.[0] || item.image_url}
                                                        alt={item.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Image className="w-10 h-10 text-zinc-600" />
                                                    </div>
                                                )}
                                                {/* Actions */}
                                                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleEditPortfolio(item)}
                                                        className="w-8 h-8 rounded-lg bg-black/60 backdrop-blur text-white hover:bg-white/20 flex items-center justify-center"
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeletePortfolio(item.id)}
                                                        className="w-8 h-8 rounded-lg bg-black/60 backdrop-blur text-red-400 hover:bg-red-500/20 flex items-center justify-center"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            {/* Info */}
                                            <div className="p-4">
                                                <h4 className="font-medium text-white truncate mb-1">{item.title}</h4>
                                                {item.description && (
                                                    <p className="text-xs text-zinc-500 line-clamp-2">{item.description}</p>
                                                )}
                                                {item.project_url && (
                                                    <a
                                                        href={item.project_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 mt-2 text-xs text-blue-400 hover:text-blue-300"
                                                    >
                                                        <Link2 className="w-3 h-3" />
                                                        View Project
                                                    </a>
                                                )}
                                            </div>
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

                {/* Availability Section */}
                <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl">
                    <div className="px-6 py-4 border-b border-white/[0.06]">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Clock className="w-5 h-5 text-green-400" />
                            Availability
                        </h2>
                    </div>
                    <div className="p-6">
                        <div className="grid sm:grid-cols-3 gap-4 mb-6">
                            {AVAILABILITY_OPTIONS.map((option) => (
                                <label
                                    key={option.value}
                                    className={cn(
                                        "flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all",
                                        availabilityStatus === option.value
                                            ? "bg-emerald-500/10 border-emerald-500/30"
                                            : "bg-white/[0.02] border-white/[0.06] hover:border-white/15"
                                    )}
                                >
                                    <input
                                        type="radio"
                                        name="availability"
                                        value={option.value}
                                        checked={availabilityStatus === option.value}
                                        onChange={(e) => setAvailabilityStatus(e.target.value)}
                                        className="sr-only"
                                    />
                                    <div className={cn(
                                        "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                                        availabilityStatus === option.value ? "border-emerald-400" : "border-zinc-600"
                                    )}>
                                        {availabilityStatus === option.value && (
                                            <div className="w-2 h-2 rounded-full bg-emerald-400" />
                                        )}
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-white">{option.label}</div>
                                        <div className="text-xs text-zinc-500">{option.description}</div>
                                    </div>
                                </label>
                            ))}
                        </div>

                        <label className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] cursor-pointer hover:border-white/15 transition-all">
                            <div>
                                <div className="text-sm font-medium text-white">Show "Available" badge</div>
                                <div className="text-xs text-zinc-500">Display a green badge on your profile</div>
                            </div>
                            <div className={cn(
                                "w-12 h-7 rounded-full p-1 transition-colors",
                                availableForHire ? "bg-emerald-500" : "bg-zinc-700"
                            )}>
                                <div className={cn(
                                    "w-5 h-5 rounded-full bg-white transition-transform",
                                    availableForHire ? "translate-x-5" : "translate-x-0"
                                )} />
                            </div>
                            <input
                                type="checkbox"
                                checked={availableForHire}
                                onChange={(e) => setAvailableForHire(e.target.checked)}
                                className="sr-only"
                            />
                        </label>
                    </div>
                </div>

                {/* Bottom Save Button */}
                <div className="flex justify-end gap-3 pt-4">
                    <Link to={`/freelancer/${user?.id}`}>
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
