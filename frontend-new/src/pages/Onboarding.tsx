import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { useAuth } from "@/context/AuthContext"
import { ProfileAPI, UploadAPI } from "@/lib/api"
import { GradientSlideButton } from "@/components/ui/GradientSlideButton"
import {
    User, Briefcase, MapPin, DollarSign, Link as LinkIcon,
    ArrowRight, ArrowLeft, Check, Camera, Plus, X, Loader2, Upload
} from "lucide-react"
import { cn } from "@/lib/utils"

interface OnboardingData {
    // Basic Info (Required)
    display_name: string
    professional_title: string
    bio: string

    // Details (Optional for clients, some required for freelancers)
    hourly_rate_sol?: number
    country?: string
    avatar_url?: string

    // Portfolio (Optional)
    portfolio_items: {
        title: string
        description: string
        url?: string
        image_url?: string
    }[]

    // Skills (Required for freelancers)
    skills: string[]

    // Socials (Optional)
    socials: {
        platform: 'website' | 'twitter' | 'telegram' | 'discord'
        url: string
    }[]
}

const STEPS = {
    freelancer: ['Basic Info', 'Skills & Rate', 'Portfolio', 'Social Links'],
    client: ['Basic Info', 'Company Details']
}

const POPULAR_SKILLS = [
    'Rust', 'Solana', 'TypeScript', 'React', 'Smart Contracts',
    'Web3', 'DeFi', 'NFT', 'Python', 'Node.js', 'Solidity',
    'Frontend', 'Backend', 'Full Stack', 'UI/UX Design',
    'Community Management', 'Marketing', 'Content Writing'
]

export function Onboarding() {
    const navigate = useNavigate()
    const { user, profile, isLoading: authLoading } = useAuth()
    const [currentStep, setCurrentStep] = useState(0)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [data, setData] = useState<OnboardingData>({
        display_name: '',
        professional_title: '',
        bio: '',
        hourly_rate_sol: undefined,
        country: '',
        avatar_url: '',
        portfolio_items: [],
        skills: [],
        socials: []
    })
    const [uploadingAvatar, setUploadingAvatar] = useState(false)
    const avatarInputRef = useRef<HTMLInputElement>(null)

    const isFreelancer = user?.role === 'freelancer'
    const steps = STEPS[isFreelancer ? 'freelancer' : 'client']

    // Redirect if not logged in or already has profile
    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                navigate('/auth')
            } else if (profile?.display_name && profile?.professional_title) {
                // Already has complete profile
                navigate(isFreelancer ? '/freelancer/dashboard' : '/client/dashboard')
            }
        }
    }, [user, profile, authLoading, navigate, isFreelancer])

    // Pre-fill with username if available
    useEffect(() => {
        if (user?.username && !data.display_name) {
            setData(prev => ({ ...prev, display_name: user.username || '' }))
        }
    }, [user])

    const updateData = (field: keyof OnboardingData, value: any) => {
        setData(prev => ({ ...prev, [field]: value }))
        setError(null)
    }

    const addSkill = (skill: string) => {
        if (!data.skills.includes(skill)) {
            updateData('skills', [...data.skills, skill])
        }
    }

    const removeSkill = (skill: string) => {
        updateData('skills', data.skills.filter(s => s !== skill))
    }

    const addPortfolioItem = () => {
        updateData('portfolio_items', [
            ...data.portfolio_items,
            { title: '', description: '', url: '', image_url: '' }
        ])
    }

    const updatePortfolioItem = (index: number, field: string, value: string) => {
        const items = [...data.portfolio_items]
        items[index] = { ...items[index], [field]: value }
        updateData('portfolio_items', items)
    }

    const removePortfolioItem = (index: number) => {
        updateData('portfolio_items', data.portfolio_items.filter((_, i) => i !== index))
    }

    const addSocial = (platform: 'website' | 'twitter' | 'telegram' | 'discord') => {
        if (!data.socials.find(s => s.platform === platform)) {
            updateData('socials', [...data.socials, { platform, url: '' }])
        }
    }

    const updateSocial = (platform: string, url: string) => {
        updateData('socials', data.socials.map(s =>
            s.platform === platform ? { ...s, url } : s
        ))
    }

    const _removeSocial = (platform: string) => {
        updateData('socials', data.socials.filter(s => s.platform !== platform))
    }

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        if (!allowedTypes.includes(file.type)) {
            setError('Please upload a valid image file (JPG, PNG, GIF, or WebP)')
            return
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('Image must be less than 5MB')
            return
        }

        setUploadingAvatar(true)
        setError(null)

        try {
            const result = await UploadAPI.uploadFile(file)
            updateData('avatar_url', result.url)
        } catch (err: any) {
            console.error('Avatar upload failed:', err)
            setError(err.response?.data?.message || 'Failed to upload image. Please try again.')
        } finally {
            setUploadingAvatar(false)
        }
    }

    const validateStep = (): boolean => {
        if (currentStep === 0) {
            // Basic Info
            if (!data.display_name.trim()) {
                setError('Display name is required')
                return false
            }
            if (!data.professional_title.trim()) {
                setError('Professional title is required')
                return false
            }
            if (!data.bio.trim() || data.bio.length < 50) {
                setError('Bio must be at least 50 characters')
                return false
            }
        }

        if (currentStep === 1 && isFreelancer) {
            // Skills & Rate
            if (data.skills.length < 1) {
                setError('Select at least 1 skill')
                return false
            }
            if (!data.hourly_rate_sol || data.hourly_rate_sol <= 0) {
                setError('Enter your hourly rate')
                return false
            }
        }

        return true
    }

    const handleNext = () => {
        if (!validateStep()) return

        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1)
        } else {
            handleSubmit()
        }
    }

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1)
        }
    }

    const handleSubmit = async () => {
        if (!validateStep()) return

        setIsSubmitting(true)
        setError(null)

        try {
            // Update profile
            await ProfileAPI.update({
                display_name: data.display_name,
                professional_title: data.professional_title,
                bio: data.bio,
                hourly_rate_sol: data.hourly_rate_sol,
                country: data.country || undefined,
                avatar_url: data.avatar_url || undefined,
                available_for_hire: isFreelancer
            })

            // Set skills if freelancer
            if (isFreelancer && data.skills.length > 0) {
                await ProfileAPI.setSkills(data.skills)
            }

            // Add portfolio items
            for (const item of data.portfolio_items) {
                if (item.title && item.description) {
                    await ProfileAPI.addPortfolioItem(item)
                }
            }

            // Set socials
            const validSocials = data.socials.filter(s => s.url.trim())
            if (validSocials.length > 0) {
                await ProfileAPI.setSocials(validSocials)
            }

            // Navigate to dashboard
            navigate(isFreelancer ? '/freelancer/dashboard' : '/client/dashboard')
        } catch (err: any) {
            console.error('Onboarding failed:', err)
            setError(err.response?.data?.message || 'Failed to save profile. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (authLoading) {
        return (
            <div className="min-h-screen bg-[#020204] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#020204] pt-20 pb-12">
            <div className="container max-w-2xl mx-auto px-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-10"
                >
                    <h1 className="text-3xl font-heading font-bold text-white mb-3">
                        Complete Your Profile
                    </h1>
                    <p className="text-zinc-400">
                        {isFreelancer
                            ? "Let clients know about your skills and experience"
                            : "Tell freelancers about yourself and your company"}
                    </p>
                </motion.div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center gap-2 mb-10">
                    {steps.map((step, index) => (
                        <div key={step} className="flex items-center">
                            <div
                                className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                                    index < currentStep
                                        ? "bg-emerald-500 text-white"
                                        : index === currentStep
                                            ? "bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400"
                                            : "bg-zinc-800 text-zinc-500"
                                )}
                            >
                                {index < currentStep ? <Check className="w-4 h-4" /> : index + 1}
                            </div>
                            {index < steps.length - 1 && (
                                <div className={cn(
                                    "w-12 h-0.5 mx-2",
                                    index < currentStep ? "bg-emerald-500" : "bg-zinc-800"
                                )} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Step Content */}
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-[#0a0a0c] border border-white/[0.06] rounded-2xl p-8"
                >
                    <h2 className="text-xl font-bold text-white mb-6">{steps[currentStep]}</h2>

                    {/* Step 0: Basic Info */}
                    {currentStep === 0 && (
                        <div className="space-y-6">
                            {/* Avatar */}
                            <div className="flex items-center gap-4">
                                <div className="relative group">
                                    {data.avatar_url ? (
                                        <img
                                            src={data.avatar_url}
                                            alt="Profile"
                                            className="w-20 h-20 rounded-full object-cover ring-4 ring-emerald-500/20"
                                        />
                                    ) : (
                                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-2xl font-bold">
                                            {data.display_name?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || '?'}
                                        </div>
                                    )}
                                    {/* Upload overlay */}
                                    <button
                                        type="button"
                                        onClick={() => avatarInputRef.current?.click()}
                                        disabled={uploadingAvatar}
                                        className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                    >
                                        {uploadingAvatar ? (
                                            <Loader2 className="w-6 h-6 text-white animate-spin" />
                                        ) : (
                                            <Camera className="w-6 h-6 text-white" />
                                        )}
                                    </button>
                                    <input
                                        ref={avatarInputRef}
                                        type="file"
                                        accept="image/jpeg,image/png,image/gif,image/webp"
                                        onChange={handleAvatarUpload}
                                        className="hidden"
                                    />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-zinc-300 mb-2">Profile Photo</p>
                                    <div className="flex flex-col gap-2">
                                        <button
                                            type="button"
                                            onClick={() => avatarInputRef.current?.click()}
                                            disabled={uploadingAvatar}
                                            className="flex items-center gap-2 px-4 py-2 bg-white/[0.02] border border-white/[0.08] rounded-lg text-sm text-zinc-400 hover:text-white hover:border-emerald-500/30 transition-colors"
                                        >
                                            {uploadingAvatar ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Uploading...
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="w-4 h-4" />
                                                    Upload from computer
                                                </>
                                            )}
                                        </button>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-zinc-600">or</span>
                                            <input
                                                type="text"
                                                placeholder="Paste image URL"
                                                value={data.avatar_url || ''}
                                                onChange={(e) => updateData('avatar_url', e.target.value)}
                                                className="flex-1 px-3 py-1.5 bg-white/[0.02] border border-white/[0.08] rounded-lg text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50"
                                            />
                                        </div>
                                    </div>
                                    <p className="text-xs text-zinc-500 mt-2">JPG, PNG, GIF, WebP • Max 5MB</p>
                                </div>
                            </div>

                            {/* Display Name */}
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">
                                    Display Name <span className="text-red-400">*</span>
                                </label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                                    <input
                                        type="text"
                                        required
                                        value={data.display_name}
                                        onChange={(e) => updateData('display_name', e.target.value)}
                                        className="w-full h-12 pl-12 pr-4 bg-white/[0.02] border border-white/[0.08] rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50"
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>

                            {/* Professional Title */}
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">
                                    Professional Title <span className="text-red-400">*</span>
                                </label>
                                <div className="relative">
                                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                                    <input
                                        type="text"
                                        required
                                        value={data.professional_title}
                                        onChange={(e) => updateData('professional_title', e.target.value)}
                                        className="w-full h-12 pl-12 pr-4 bg-white/[0.02] border border-white/[0.08] rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50"
                                        placeholder={isFreelancer ? "Senior Rust Developer" : "Founder & CEO"}
                                    />
                                </div>
                            </div>

                            {/* Bio */}
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">
                                    Bio <span className="text-red-400">*</span>
                                    <span className="text-zinc-500 font-normal ml-2">(min 50 characters)</span>
                                </label>
                                <textarea
                                    required
                                    value={data.bio}
                                    onChange={(e) => updateData('bio', e.target.value)}
                                    rows={4}
                                    className="w-full px-4 py-3 bg-white/[0.02] border border-white/[0.08] rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 resize-none"
                                    placeholder={isFreelancer
                                        ? "Tell clients about your experience, what you specialize in, and what makes you unique..."
                                        : "Tell freelancers about your company, the projects you work on, and what you're looking for..."}
                                />
                                <div className="text-xs text-zinc-500 mt-1 text-right">
                                    {data.bio.length}/50 minimum
                                </div>
                            </div>

                            {/* Country */}
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">
                                    Country <span className="text-zinc-500 font-normal">(Optional)</span>
                                </label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                                    <input
                                        type="text"
                                        value={data.country || ''}
                                        onChange={(e) => updateData('country', e.target.value)}
                                        className="w-full h-12 pl-12 pr-4 bg-white/[0.02] border border-white/[0.08] rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50"
                                        placeholder="United States"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 1: Skills & Rate (Freelancer) or Company Details (Client) */}
                    {currentStep === 1 && isFreelancer && (
                        <div className="space-y-6">
                            {/* Skills */}
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">
                                    Skills <span className="text-red-400">*</span>
                                    <span className="text-zinc-500 font-normal ml-2">(select at least 1)</span>
                                </label>

                                {/* Selected Skills */}
                                {data.skills.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {data.skills.map(skill => (
                                            <span
                                                key={skill}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm"
                                            >
                                                {skill}
                                                <button onClick={() => removeSkill(skill)} className="hover:text-white">
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Popular Skills */}
                                <p className="text-xs text-zinc-500 mb-2">Popular skills:</p>
                                <div className="flex flex-wrap gap-2">
                                    {POPULAR_SKILLS.filter(s => !data.skills.includes(s)).map(skill => (
                                        <button
                                            key={skill}
                                            type="button"
                                            onClick={() => addSkill(skill)}
                                            className="px-3 py-1.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 text-sm hover:border-emerald-500/30 hover:text-white transition-colors"
                                        >
                                            + {skill}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Hourly Rate */}
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">
                                    Hourly Rate (SOL) <span className="text-red-400">*</span>
                                </label>
                                <div className="relative">
                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        step="0.1"
                                        value={data.hourly_rate_sol || ''}
                                        onChange={(e) => updateData('hourly_rate_sol', parseFloat(e.target.value) || undefined)}
                                        className="w-full h-12 pl-12 pr-4 bg-white/[0.02] border border-white/[0.08] rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50"
                                        placeholder="25"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500">SOL/hr</span>
                                </div>
                                <p className="text-xs text-zinc-500 mt-2">
                                    This is your default rate. You can customize it for each proposal.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Step 1: Company Details (Client) */}
                    {currentStep === 1 && !isFreelancer && (
                        <div className="space-y-6">
                            <p className="text-zinc-400">
                                Add any additional details about your company or organization. This helps freelancers understand who they'll be working with.
                            </p>

                            {/* Website */}
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">
                                    Company Website <span className="text-zinc-500 font-normal">(Optional)</span>
                                </label>
                                <div className="relative">
                                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                                    <input
                                        type="url"
                                        value={data.socials.find(s => s.platform === 'website')?.url || ''}
                                        onChange={(e) => {
                                            if (!data.socials.find(s => s.platform === 'website')) {
                                                addSocial('website')
                                            }
                                            updateSocial('website', e.target.value)
                                        }}
                                        className="w-full h-12 pl-12 pr-4 bg-white/[0.02] border border-white/[0.08] rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50"
                                        placeholder="https://yourcompany.com"
                                    />
                                </div>
                            </div>

                            {/* Twitter */}
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">
                                    Twitter/X <span className="text-zinc-500 font-normal">(Optional)</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.socials.find(s => s.platform === 'twitter')?.url || ''}
                                    onChange={(e) => {
                                        if (!data.socials.find(s => s.platform === 'twitter')) {
                                            addSocial('twitter')
                                        }
                                        updateSocial('twitter', e.target.value)
                                    }}
                                    className="w-full h-12 px-4 bg-white/[0.02] border border-white/[0.08] rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50"
                                    placeholder="https://twitter.com/yourcompany"
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 2: Portfolio (Freelancer) */}
                    {currentStep === 2 && isFreelancer && (
                        <div className="space-y-6">
                            <p className="text-zinc-400 mb-4">
                                Add your best work to showcase your skills. You can add more later.
                            </p>

                            {data.portfolio_items.map((item, index) => (
                                <div key={index} className="p-4 bg-white/[0.02] border border-white/[0.08] rounded-xl space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-zinc-400">Project {index + 1}</span>
                                        <button
                                            type="button"
                                            onClick={() => removePortfolioItem(index)}
                                            className="text-red-400 hover:text-red-300"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <input
                                        type="text"
                                        placeholder="Project Title"
                                        value={item.title}
                                        onChange={(e) => updatePortfolioItem(index, 'title', e.target.value)}
                                        className="w-full h-10 px-4 bg-white/[0.02] border border-white/[0.08] rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50"
                                    />

                                    <textarea
                                        placeholder="Brief description of the project..."
                                        value={item.description}
                                        onChange={(e) => updatePortfolioItem(index, 'description', e.target.value)}
                                        rows={2}
                                        className="w-full px-4 py-2 bg-white/[0.02] border border-white/[0.08] rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 resize-none"
                                    />

                                    <input
                                        type="url"
                                        placeholder="Project URL (optional)"
                                        value={item.url || ''}
                                        onChange={(e) => updatePortfolioItem(index, 'url', e.target.value)}
                                        className="w-full h-10 px-4 bg-white/[0.02] border border-white/[0.08] rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50"
                                    />
                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={addPortfolioItem}
                                className="w-full py-3 border-2 border-dashed border-zinc-700 rounded-xl text-zinc-400 hover:border-emerald-500/30 hover:text-emerald-400 transition-colors flex items-center justify-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Add Project
                            </button>

                            <p className="text-xs text-zinc-500 text-center">
                                Portfolio is optional but highly recommended to attract more clients.
                            </p>
                        </div>
                    )}

                    {/* Step 3: Social Links (Freelancer) */}
                    {currentStep === 3 && isFreelancer && (
                        <div className="space-y-6">
                            <p className="text-zinc-400 mb-4">
                                Add your social profiles to build trust with clients.
                            </p>

                            {/* Website */}
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">Website</label>
                                <input
                                    type="url"
                                    placeholder="https://yourwebsite.com"
                                    value={data.socials.find(s => s.platform === 'website')?.url || ''}
                                    onChange={(e) => {
                                        if (!data.socials.find(s => s.platform === 'website')) addSocial('website')
                                        updateSocial('website', e.target.value)
                                    }}
                                    className="w-full h-12 px-4 bg-white/[0.02] border border-white/[0.08] rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50"
                                />
                            </div>

                            {/* Twitter */}
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">Twitter/X</label>
                                <input
                                    type="text"
                                    placeholder="https://twitter.com/yourhandle"
                                    value={data.socials.find(s => s.platform === 'twitter')?.url || ''}
                                    onChange={(e) => {
                                        if (!data.socials.find(s => s.platform === 'twitter')) addSocial('twitter')
                                        updateSocial('twitter', e.target.value)
                                    }}
                                    className="w-full h-12 px-4 bg-white/[0.02] border border-white/[0.08] rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50"
                                />
                            </div>

                            {/* Telegram */}
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">Telegram</label>
                                <input
                                    type="text"
                                    placeholder="https://t.me/yourhandle"
                                    value={data.socials.find(s => s.platform === 'telegram')?.url || ''}
                                    onChange={(e) => {
                                        if (!data.socials.find(s => s.platform === 'telegram')) addSocial('telegram')
                                        updateSocial('telegram', e.target.value)
                                    }}
                                    className="w-full h-12 px-4 bg-white/[0.02] border border-white/[0.08] rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50"
                                />
                            </div>

                            {/* Discord */}
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">Discord</label>
                                <input
                                    type="text"
                                    placeholder="yourhandle#1234"
                                    value={data.socials.find(s => s.platform === 'discord')?.url || ''}
                                    onChange={(e) => {
                                        if (!data.socials.find(s => s.platform === 'discord')) addSocial('discord')
                                        updateSocial('discord', e.target.value)
                                    }}
                                    className="w-full h-12 px-4 bg-white/[0.02] border border-white/[0.08] rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50"
                                />
                            </div>

                            <p className="text-xs text-zinc-500 text-center">
                                All social links are optional but help build credibility.
                            </p>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="mt-6 text-sm text-red-400 bg-red-500/10 p-4 rounded-xl border border-red-500/20">
                            {error}
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/[0.06]">
                        <button
                            type="button"
                            onClick={handleBack}
                            disabled={currentStep === 0}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                                currentStep === 0
                                    ? "text-zinc-600 cursor-not-allowed"
                                    : "text-zinc-400 hover:text-white"
                            )}
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back
                        </button>

                        <GradientSlideButton
                            onClick={handleNext}
                            disabled={isSubmitting}
                            className="px-8 py-3 rounded-xl"
                            colorFrom="#10B981"
                            colorTo="#14F195"
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : currentStep === steps.length - 1 ? (
                                <>
                                    Complete Setup
                                    <Check className="w-4 h-4 ml-2" />
                                </>
                            ) : (
                                <>
                                    Continue
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </>
                            )}
                        </GradientSlideButton>
                    </div>
                </motion.div>

                {/* Skip for now */}
                {currentStep > 0 && (
                    <p className="text-center text-zinc-500 text-sm mt-6">
                        <button
                            onClick={handleSubmit}
                            className="hover:text-zinc-300 underline underline-offset-4"
                        >
                            Skip and complete later
                        </button>
                    </p>
                )}
            </div>
        </div>
    )
}
