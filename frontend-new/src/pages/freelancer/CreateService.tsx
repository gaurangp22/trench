import { useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/Button"
import { motion } from "framer-motion"
import { Loader2, ArrowLeft, Package, Check, Upload, X, Plus } from "lucide-react"
import { ServiceAPI, SkillsAPI, type CreateServiceRequest, type Skill } from "@/lib/api"
import { cn } from "@/lib/utils"
import { useEffect } from "react"

const CATEGORIES = [
    { id: 1, name: "Web Development", slug: "web-development" },
    { id: 2, name: "Blockchain & Web3", slug: "blockchain-web3" },
    { id: 3, name: "Design", slug: "design" },
    { id: 4, name: "Writing", slug: "writing" },
    { id: 5, name: "Marketing", slug: "marketing" },
    { id: 6, name: "Data & Analytics", slug: "data-analytics" },
]

type Step = 1 | 2 | 3

export function CreateService() {
    const navigate = useNavigate()
    const [step, setStep] = useState<Step>(1)
    const [loading, setLoading] = useState(false)
    const [allSkills, setAllSkills] = useState<Skill[]>([])

    // Gallery state
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
    const [galleryFiles, setGalleryFiles] = useState<File[]>([])
    const [galleryPreviews, setGalleryPreviews] = useState<string[]>([])
    const thumbnailInputRef = useRef<HTMLInputElement>(null)
    const galleryInputRef = useRef<HTMLInputElement>(null)

    // Form state
    const [formData, setFormData] = useState<CreateServiceRequest>({
        title: "",
        description: "",
        category_id: undefined,
        skills: [],
        basic_price_sol: undefined,
        basic_description: undefined,
        basic_delivery_days: undefined,
        basic_revisions: 1,
        standard_price_sol: undefined,
        standard_description: undefined,
        standard_delivery_days: undefined,
        standard_revisions: 2,
        premium_price_sol: undefined,
        premium_description: undefined,
        premium_delivery_days: undefined,
        premium_revisions: 3,
    })

    useEffect(() => {
        const loadSkills = async () => {
            try {
                const { skills } = await SkillsAPI.list()
                setAllSkills(skills)
            } catch (error) {
                console.error("Failed to load skills:", error)
            }
        }
        loadSkills()
    }, [])

    const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setThumbnailFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setThumbnailPreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        if (files.length + galleryFiles.length > 5) {
            alert('Maximum 5 gallery images allowed')
            return
        }

        const newFiles = [...galleryFiles, ...files].slice(0, 5)
        setGalleryFiles(newFiles)

        // Generate previews
        newFiles.forEach((file, idx) => {
            if (idx >= galleryPreviews.length) {
                const reader = new FileReader()
                reader.onloadend = () => {
                    setGalleryPreviews(prev => [...prev, reader.result as string].slice(0, 5))
                }
                reader.readAsDataURL(file)
            }
        })
    }

    const removeGalleryImage = (index: number) => {
        setGalleryFiles(prev => prev.filter((_, i) => i !== index))
        setGalleryPreviews(prev => prev.filter((_, i) => i !== index))
    }

    const removeThumbnail = () => {
        setThumbnailFile(null)
        setThumbnailPreview(null)
    }

    const handleSubmit = async () => {
        setLoading(true)
        try {
            const service = await ServiceAPI.create(formData)
            navigate(`/freelancer/services/${service.id}`)
        } catch (error) {
            console.error("Failed to create service:", error)
            alert("Failed to create service. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    const toggleSkill = (skillId: number) => {
        setFormData(prev => ({
            ...prev,
            skills: prev.skills?.includes(skillId)
                ? prev.skills.filter(id => id !== skillId)
                : [...(prev.skills || []), skillId]
        }))
    }

    const canProceedStep1 = formData.title && formData.description && formData.category_id && thumbnailFile
    const canProceedStep2 = formData.basic_price_sol || formData.standard_price_sol || formData.premium_price_sol

    return (
        <DashboardLayout role="freelancer">
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-4"
                >
                    <button
                        onClick={() => step > 1 ? setStep((step - 1) as Step) : navigate('/freelancer/services')}
                        className="w-10 h-10 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Create a Service</h1>
                        <p className="text-zinc-400 text-sm">Step {step} of 3</p>
                    </div>
                </motion.div>

                {/* Progress */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="flex items-center gap-2"
                >
                    {[1, 2, 3].map((s) => (
                        <div
                            key={s}
                            className={cn(
                                "flex-1 h-1.5 rounded-full transition-colors",
                                s <= step ? "bg-indigo-500" : "bg-white/10"
                            )}
                        />
                    ))}
                </motion.div>

                {/* Step 1: Basic Info & Gallery */}
                {step === 1 && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        {/* Gallery Upload Section - Work Maximized */}
                        <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-6 space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-2">Showcase Your Work</h3>
                                <p className="text-sm text-zinc-500">Your gallery is the first thing clients see. Make it count!</p>
                            </div>

                            {/* Thumbnail Upload */}
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">
                                    Cover Image <span className="text-red-400">*</span>
                                </label>
                                <input
                                    ref={thumbnailInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleThumbnailChange}
                                    className="hidden"
                                />
                                {thumbnailPreview ? (
                                    <div className="relative aspect-video rounded-xl overflow-hidden border border-white/[0.1] bg-white/[0.02]">
                                        <img
                                            src={thumbnailPreview}
                                            alt="Thumbnail preview"
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            onClick={removeThumbnail}
                                            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                        <div className="absolute bottom-3 left-3 px-2 py-1 text-xs bg-black/60 backdrop-blur-sm text-white rounded-lg">
                                            Cover Image
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => thumbnailInputRef.current?.click()}
                                        className="w-full aspect-video rounded-xl border-2 border-dashed border-white/[0.1] bg-white/[0.01] hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all flex flex-col items-center justify-center gap-3"
                                    >
                                        <div className="w-16 h-16 rounded-2xl bg-white/[0.05] flex items-center justify-center">
                                            <Upload className="w-8 h-8 text-zinc-500" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-medium text-zinc-300">Upload Cover Image</p>
                                            <p className="text-xs text-zinc-500 mt-1">This is the main image clients will see</p>
                                        </div>
                                    </button>
                                )}
                            </div>

                            {/* Gallery Upload */}
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">
                                    Gallery Images <span className="text-zinc-500">(up to 5)</span>
                                </label>
                                <input
                                    ref={galleryInputRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleGalleryChange}
                                    className="hidden"
                                />
                                <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                                    {galleryPreviews.map((preview, idx) => (
                                        <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-white/[0.1] bg-white/[0.02]">
                                            <img
                                                src={preview}
                                                alt={`Gallery ${idx + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                onClick={() => removeGalleryImage(idx)}
                                                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-red-500 transition-colors"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                    {galleryPreviews.length < 5 && (
                                        <button
                                            onClick={() => galleryInputRef.current?.click()}
                                            className="aspect-square rounded-xl border-2 border-dashed border-white/[0.1] bg-white/[0.01] hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all flex flex-col items-center justify-center gap-2"
                                        >
                                            <Plus className="w-6 h-6 text-zinc-500" />
                                            <span className="text-xs text-zinc-500">Add</span>
                                        </button>
                                    )}
                                </div>
                                <p className="text-xs text-zinc-500 mt-2">
                                    Add more images to showcase different aspects of your work
                                </p>
                            </div>
                        </div>

                        {/* Basic Info */}
                        <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">
                                    Gig Title <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="I will create a professional Solana dApp..."
                                    className="w-full h-12 bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">
                                    Category <span className="text-red-400">*</span>
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {CATEGORIES.map((cat) => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setFormData(prev => ({ ...prev, category_id: cat.id }))}
                                            className={cn(
                                                "p-3 rounded-xl border text-sm font-medium transition-all text-left",
                                                formData.category_id === cat.id
                                                    ? "bg-indigo-500/10 border-indigo-500/50 text-indigo-400"
                                                    : "bg-white/[0.02] border-white/[0.06] text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                                            )}
                                        >
                                            {cat.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">
                                    Description <span className="text-red-400">*</span>
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Describe what you offer, your process, and what clients can expect..."
                                    rows={6}
                                    className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">
                                    Tags / Skills
                                </label>
                                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                                    {allSkills.map((skill) => (
                                        <button
                                            key={skill.id}
                                            onClick={() => toggleSkill(Number(skill.id))}
                                            className={cn(
                                                "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                                                formData.skills?.includes(Number(skill.id))
                                                    ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/50"
                                                    : "bg-white/[0.02] text-zinc-400 border border-white/[0.06] hover:text-white"
                                            )}
                                        >
                                            {skill.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <Button
                            onClick={() => setStep(2)}
                            disabled={!canProceedStep1}
                            className="w-full h-12 rounded-xl bg-white text-black hover:bg-zinc-100 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Continue to Pricing
                        </Button>
                    </motion.div>
                )}

                {/* Step 2: Pricing */}
                {step === 2 && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-6 space-y-6">
                            <h3 className="text-lg font-semibold text-white">Set Your Pricing Tiers</h3>
                            <p className="text-sm text-zinc-400">Create at least one pricing tier. You can offer Basic, Standard, and Premium packages.</p>

                            {/* Basic Package */}
                            <div className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.01] space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-medium text-white">Basic</h4>
                                    <span className="text-xs text-zinc-500">Optional</span>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs text-zinc-500 mb-1">Price (SOL)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={formData.basic_price_sol || ''}
                                            onChange={(e) => setFormData(prev => ({ ...prev, basic_price_sol: e.target.value ? parseFloat(e.target.value) : undefined }))}
                                            placeholder="0.5"
                                            className="w-full h-10 bg-white/[0.02] border border-white/[0.06] rounded-lg px-3 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-zinc-500 mb-1">Delivery (days)</label>
                                        <input
                                            type="number"
                                            value={formData.basic_delivery_days || ''}
                                            onChange={(e) => setFormData(prev => ({ ...prev, basic_delivery_days: e.target.value ? parseInt(e.target.value) : undefined }))}
                                            placeholder="3"
                                            className="w-full h-10 bg-white/[0.02] border border-white/[0.06] rounded-lg px-3 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-zinc-500 mb-1">Revisions</label>
                                        <input
                                            type="number"
                                            value={formData.basic_revisions || ''}
                                            onChange={(e) => setFormData(prev => ({ ...prev, basic_revisions: e.target.value ? parseInt(e.target.value) : undefined }))}
                                            placeholder="1"
                                            className="w-full h-10 bg-white/[0.02] border border-white/[0.06] rounded-lg px-3 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50"
                                        />
                                    </div>
                                </div>
                                <input
                                    type="text"
                                    value={formData.basic_description || ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, basic_description: e.target.value || undefined }))}
                                    placeholder="What's included in the basic package?"
                                    className="w-full h-10 bg-white/[0.02] border border-white/[0.06] rounded-lg px-3 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50"
                                />
                            </div>

                            {/* Standard Package */}
                            <div className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-500/5 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-medium text-white">Standard</h4>
                                    <span className="text-xs text-indigo-400">Recommended</span>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs text-zinc-500 mb-1">Price (SOL)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={formData.standard_price_sol || ''}
                                            onChange={(e) => setFormData(prev => ({ ...prev, standard_price_sol: e.target.value ? parseFloat(e.target.value) : undefined }))}
                                            placeholder="1.5"
                                            className="w-full h-10 bg-white/[0.02] border border-white/[0.06] rounded-lg px-3 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-zinc-500 mb-1">Delivery (days)</label>
                                        <input
                                            type="number"
                                            value={formData.standard_delivery_days || ''}
                                            onChange={(e) => setFormData(prev => ({ ...prev, standard_delivery_days: e.target.value ? parseInt(e.target.value) : undefined }))}
                                            placeholder="5"
                                            className="w-full h-10 bg-white/[0.02] border border-white/[0.06] rounded-lg px-3 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-zinc-500 mb-1">Revisions</label>
                                        <input
                                            type="number"
                                            value={formData.standard_revisions || ''}
                                            onChange={(e) => setFormData(prev => ({ ...prev, standard_revisions: e.target.value ? parseInt(e.target.value) : undefined }))}
                                            placeholder="2"
                                            className="w-full h-10 bg-white/[0.02] border border-white/[0.06] rounded-lg px-3 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50"
                                        />
                                    </div>
                                </div>
                                <input
                                    type="text"
                                    value={formData.standard_description || ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, standard_description: e.target.value || undefined }))}
                                    placeholder="What's included in the standard package?"
                                    className="w-full h-10 bg-white/[0.02] border border-white/[0.06] rounded-lg px-3 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50"
                                />
                            </div>

                            {/* Premium Package */}
                            <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-medium text-white">Premium</h4>
                                    <span className="text-xs text-amber-400">Optional</span>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs text-zinc-500 mb-1">Price (SOL)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={formData.premium_price_sol || ''}
                                            onChange={(e) => setFormData(prev => ({ ...prev, premium_price_sol: e.target.value ? parseFloat(e.target.value) : undefined }))}
                                            placeholder="5.0"
                                            className="w-full h-10 bg-white/[0.02] border border-white/[0.06] rounded-lg px-3 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-zinc-500 mb-1">Delivery (days)</label>
                                        <input
                                            type="number"
                                            value={formData.premium_delivery_days || ''}
                                            onChange={(e) => setFormData(prev => ({ ...prev, premium_delivery_days: e.target.value ? parseInt(e.target.value) : undefined }))}
                                            placeholder="7"
                                            className="w-full h-10 bg-white/[0.02] border border-white/[0.06] rounded-lg px-3 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-zinc-500 mb-1">Revisions</label>
                                        <input
                                            type="number"
                                            value={formData.premium_revisions || ''}
                                            onChange={(e) => setFormData(prev => ({ ...prev, premium_revisions: e.target.value ? parseInt(e.target.value) : undefined }))}
                                            placeholder="3"
                                            className="w-full h-10 bg-white/[0.02] border border-white/[0.06] rounded-lg px-3 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50"
                                        />
                                    </div>
                                </div>
                                <input
                                    type="text"
                                    value={formData.premium_description || ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, premium_description: e.target.value || undefined }))}
                                    placeholder="What's included in the premium package?"
                                    className="w-full h-10 bg-white/[0.02] border border-white/[0.06] rounded-lg px-3 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50"
                                />
                            </div>
                        </div>

                        <Button
                            onClick={() => setStep(3)}
                            disabled={!canProceedStep2}
                            className="w-full h-12 rounded-xl bg-white text-black hover:bg-zinc-100 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Review & Create
                        </Button>
                    </motion.div>
                )}

                {/* Step 3: Review */}
                {step === 3 && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-6 space-y-6">
                            <h3 className="text-lg font-semibold text-white">Review Your Service</h3>

                            <div className="space-y-4">
                                <div>
                                    <span className="text-xs text-zinc-500 uppercase tracking-wider">Title</span>
                                    <p className="text-white font-medium mt-1">{formData.title}</p>
                                </div>

                                <div>
                                    <span className="text-xs text-zinc-500 uppercase tracking-wider">Category</span>
                                    <p className="text-white mt-1">
                                        {CATEGORIES.find(c => c.id === formData.category_id)?.name}
                                    </p>
                                </div>

                                <div>
                                    <span className="text-xs text-zinc-500 uppercase tracking-wider">Description</span>
                                    <p className="text-zinc-300 text-sm mt-1 whitespace-pre-wrap">{formData.description}</p>
                                </div>

                                <div>
                                    <span className="text-xs text-zinc-500 uppercase tracking-wider">Pricing</span>
                                    <div className="grid grid-cols-3 gap-4 mt-2">
                                        {formData.basic_price_sol && (
                                            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                                                <span className="text-xs text-zinc-500">Basic</span>
                                                <p className="text-indigo-400 font-semibold">{formData.basic_price_sol} SOL</p>
                                                <p className="text-xs text-zinc-500">{formData.basic_delivery_days} days</p>
                                            </div>
                                        )}
                                        {formData.standard_price_sol && (
                                            <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/30">
                                                <span className="text-xs text-indigo-400">Standard</span>
                                                <p className="text-indigo-400 font-semibold">{formData.standard_price_sol} SOL</p>
                                                <p className="text-xs text-zinc-500">{formData.standard_delivery_days} days</p>
                                            </div>
                                        )}
                                        {formData.premium_price_sol && (
                                            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                                                <span className="text-xs text-amber-400">Premium</span>
                                                <p className="text-indigo-400 font-semibold">{formData.premium_price_sol} SOL</p>
                                                <p className="text-xs text-zinc-500">{formData.premium_delivery_days} days</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                                    <Package className="w-4 h-4 text-indigo-400" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-white text-sm">Gig will be created as a draft</h4>
                                    <p className="text-xs text-zinc-400 mt-1">
                                        You can publish it anytime from your gigs dashboard.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <Button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="w-full h-12 rounded-xl bg-white text-black hover:bg-zinc-100 font-semibold disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <Check className="w-5 h-5 mr-2" />
                                    Create Service
                                </>
                            )}
                        </Button>
                    </motion.div>
                )}
            </div>
        </DashboardLayout>
    )
}
