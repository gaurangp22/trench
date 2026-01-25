import { useState, useEffect, useRef } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { ArrowLeft, Star, Shield, CheckCircle, Clock, MapPin, MessageSquare, Loader2, Briefcase, Users, Zap } from "lucide-react"
import { motion, useInView } from "framer-motion"
import { Button } from "@/components/ui/Button"
import { GradientSlideButton } from "@/components/ui/GradientSlideButton"
import { useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { cn } from "@/lib/utils"
import { JobAPI, AuthAPI, type Job } from "@/lib/api"

export function JobDetail() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { connected } = useWallet()
    const [isApplying, setIsApplying] = useState(false)
    const [job, setJob] = useState<Job | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const contentRef = useRef<HTMLDivElement>(null)
    const isContentInView = useInView(contentRef, { once: true })

    // Check auth state
    const isLoggedIn = AuthAPI.isAuthenticated()

    useEffect(() => {
        if (id) {
            loadJob()
        }
    }, [id])

    const loadJob = async () => {
        try {
            setLoading(true)
            setError(null)
            const data = await JobAPI.getById(id!)
            setJob(data)
        } catch (err) {
            console.error("Failed to load job:", err)
            setError("Failed to load job details")
        } finally {
            setLoading(false)
        }
    }

    // Determine CTA state based on auth and wallet
    const getCTAConfig = () => {
        if (!isLoggedIn) {
            return {
                label: "Create account to apply",
                action: () => navigate("/auth"),
                variant: "default" as const,
                showWalletHint: false,
            }
        }
        if (!connected) {
            return {
                label: "Connect wallet to apply",
                action: () => { },
                variant: "wallet" as const,
                showWalletHint: true,
            }
        }
        return {
            label: "Submit Proposal",
            action: () => setIsApplying(true),
            variant: "primary" as const,
            showWalletHint: false,
        }
    }

    const ctaConfig = getCTAConfig()

    if (loading) {
        return (
            <div className="min-h-screen bg-[#020204] pt-20 pb-20 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-2 border-emerald-500/30 border-t-emerald-500 animate-spin" />
                    <span className="text-zinc-500 text-sm">Loading opportunity...</span>
                </div>
            </div>
        )
    }

    if (error || !job) {
        return (
            <div className="min-h-screen bg-[#020204] pt-20 pb-20">
                <div className="container max-w-5xl mx-auto px-6 text-center py-20">
                    <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
                        <Briefcase className="w-8 h-8 text-red-400" />
                    </div>
                    <h2 className="text-2xl font-heading font-bold text-white mb-4">Job not found</h2>
                    <p className="text-zinc-400 mb-8 max-w-md mx-auto">{error || "This job may have been removed or doesn't exist."}</p>
                    <Link to="/jobs">
                        <GradientSlideButton
                            className="h-12 px-8 rounded-xl"
                            colorFrom="#8B5CF6"
                            colorTo="#EC4899"
                        >
                            Browse Jobs
                        </GradientSlideButton>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#020204] pt-24 pb-20">
            {/* Hero Header */}
            <div className="relative overflow-hidden border-b border-white/[0.06]">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[150px]" />
                    <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-teal-600/10 rounded-full blur-[120px]" />
                </div>

                <div className="container max-w-6xl mx-auto px-6 py-12 relative z-10">
                    {/* Back Button */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <Link
                            to="/jobs"
                            className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white mb-8 transition-colors group"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Back to Jobs
                        </Link>
                    </motion.div>

                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="flex-1"
                        >
                            {/* Category Badge */}
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-4">
                                <Briefcase className="w-3.5 h-3.5" />
                                Web3 Development
                            </div>

                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-white mb-4 leading-tight">
                                {job.title}
                            </h1>

                            {/* Meta Info */}
                            <div className="flex flex-wrap items-center gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-white text-xs font-bold">
                                        {job.client?.display_name?.[0] || 'C'}
                                    </div>
                                    <span className="font-medium text-white">{job.client?.display_name || 'Client'}</span>
                                    {job.client?.verified && (
                                        <CheckCircle className="w-4 h-4 text-blue-400" />
                                    )}
                                </div>
                                {job.client?.rating && (
                                    <span className="flex items-center gap-1.5 text-amber-400">
                                        <Star className="w-4 h-4 fill-current" />
                                        <span className="font-medium">{job.client.rating}</span>
                                    </span>
                                )}
                                <span className="flex items-center gap-1.5 text-zinc-500">
                                    <MapPin className="w-4 h-4" />
                                    Remote
                                </span>
                                <span className="flex items-center gap-1.5 text-zinc-500">
                                    <Clock className="w-4 h-4" />
                                    Posted {new Date(job.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        </motion.div>

                        {/* Budget Card - Floating */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="lg:w-72 p-6 rounded-2xl bg-[#0a0a0c] border border-white/[0.08] backdrop-blur"
                        >
                            <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Budget</div>
                            <div className="text-4xl font-bold text-white mb-1">
                                ◎ {job.budget}
                            </div>
                            <div className="text-sm text-zinc-400 capitalize">{job.budget_type}</div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container max-w-6xl mx-auto px-6 py-12" ref={contentRef}>
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column - Details */}
                    <motion.div
                        className="lg:col-span-2 space-y-8"
                        initial={{ opacity: 0, y: 30 }}
                        animate={isContentInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.5 }}
                    >
                        {/* Description Card */}
                        <div className="rounded-2xl border border-white/[0.06] bg-[#0a0a0c] overflow-hidden">
                            <div className="px-6 py-4 border-b border-white/[0.06]">
                                <h2 className="text-lg font-semibold text-white">Job Description</h2>
                            </div>
                            <div className="p-6">
                                <div className="prose prose-invert prose-sm max-w-none">
                                    {job.description.split('\n').map((line, i) => (
                                        <p key={i} className="text-zinc-400 leading-relaxed mb-3">
                                            {line.startsWith('**') ? (
                                                <strong className="text-white font-medium">
                                                    {line.replace(/\*\*/g, '')}
                                                </strong>
                                            ) : line.startsWith('- ') ? (
                                                <span className="flex items-start gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
                                                    <span>{line.slice(2)}</span>
                                                </span>
                                            ) : (
                                                line
                                            )}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Skills */}
                        {job.skills && job.skills.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={isContentInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                className="rounded-2xl border border-white/[0.06] bg-[#0a0a0c] overflow-hidden"
                            >
                                <div className="px-6 py-4 border-b border-white/[0.06]">
                                    <h2 className="text-lg font-semibold text-white">Required Skills</h2>
                                </div>
                                <div className="p-6">
                                    <div className="flex flex-wrap gap-2">
                                        {job.skills.map((skill, index) => (
                                            <motion.span
                                                key={skill}
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={isContentInView ? { opacity: 1, scale: 1 } : {}}
                                                transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                                                className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-300 font-medium hover:bg-emerald-500/20 transition-colors"
                                            >
                                                {skill}
                                            </motion.span>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Client Info */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={isContentInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="rounded-2xl border border-white/[0.06] bg-[#0a0a0c] overflow-hidden"
                        >
                            <div className="px-6 py-4 border-b border-white/[0.06]">
                                <h2 className="text-lg font-semibold text-white">About the Client</h2>
                            </div>
                            <div className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-emerald-500/20">
                                        {job.client?.display_name?.[0] || 'C'}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-lg font-semibold text-white">{job.client?.display_name || 'Client'}</span>
                                            {job.client?.verified && (
                                                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs text-blue-400">
                                                    <CheckCircle className="w-3 h-3" />
                                                    Verified
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-zinc-400">
                                            {job.client?.rating && (
                                                <span className="flex items-center gap-1.5">
                                                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                                    {job.client.rating} rating
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1.5">
                                                <Briefcase className="w-4 h-4" />
                                                {job.client?.jobs_posted || 0} jobs posted
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Sidebar - Apply Card */}
                    <motion.div
                        className="lg:col-span-1"
                        initial={{ opacity: 0, x: 30 }}
                        animate={isContentInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <div className="sticky top-24 rounded-2xl border border-white/[0.06] bg-[#0a0a0c] overflow-hidden">
                            {/* Gradient Top Line */}
                            <div className="h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500" />

                            <div className="p-6">
                                {/* Escrow Status */}
                                <div className={cn(
                                    "flex items-center justify-center gap-2 py-3 px-4 rounded-xl mb-6",
                                    job.escrow_funded
                                        ? "bg-emerald-500/10 border border-emerald-500/20"
                                        : "bg-white/[0.02] border border-white/[0.06]"
                                )}>
                                    <Shield className={cn(
                                        "w-5 h-5",
                                        job.escrow_funded ? "text-emerald-400" : "text-zinc-500"
                                    )} />
                                    <span className={cn(
                                        "text-sm font-medium",
                                        job.escrow_funded ? "text-emerald-400" : "text-zinc-500"
                                    )}>
                                        {job.escrow_funded ? "Escrow Funded" : "Escrow Not Yet Funded"}
                                    </span>
                                </div>

                                {job.escrow_funded && (
                                    <p className="text-xs text-zinc-500 text-center mb-6">
                                        Funds are secured on-chain. Payment is released when work is approved.
                                    </p>
                                )}

                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                                        <div className="flex items-center gap-2 text-zinc-500 text-xs mb-1">
                                            <Users className="w-3.5 h-3.5" />
                                            Proposals
                                        </div>
                                        <div className="text-xl font-bold text-white">{job.proposal_count || 0}</div>
                                    </div>
                                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                                        <div className="flex items-center gap-2 text-zinc-500 text-xs mb-1">
                                            <Zap className="w-3.5 h-3.5" />
                                            Level
                                        </div>
                                        <div className="text-xl font-bold text-white capitalize">{job.difficulty}</div>
                                    </div>
                                </div>

                                {/* CTA */}
                                {ctaConfig.variant === "wallet" ? (
                                    <WalletMultiButton className="!w-full !h-12 !justify-center !bg-gradient-to-r from-emerald-500 to-teal-400 !rounded-xl !font-medium" />
                                ) : (
                                    <GradientSlideButton
                                        onClick={ctaConfig.action}
                                        className="w-full h-12 text-base font-semibold rounded-xl"
                                        colorFrom="#10B981"
                                        colorTo="#14F195"
                                    >
                                        {ctaConfig.label}
                                    </GradientSlideButton>
                                )}

                                {!isLoggedIn && (
                                    <p className="text-xs text-zinc-500 text-center mt-4">
                                        Already have an account?{" "}
                                        <Link to="/auth" className="text-emerald-400 hover:text-emerald-300 transition-colors">
                                            Log in
                                        </Link>
                                    </p>
                                )}

                                {/* Message Option */}
                                <div className="mt-6 pt-6 border-t border-white/[0.06]">
                                    <button className="w-full flex items-center justify-center gap-2 py-3 text-sm text-zinc-400 hover:text-white rounded-xl hover:bg-white/[0.02] transition-all">
                                        <MessageSquare className="w-4 h-4" />
                                        Message Client
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Proposal Modal */}
            {isApplying && job && (
                <ProposalModal
                    job={job}
                    onClose={() => setIsApplying(false)}
                    onSuccess={() => {
                        setIsApplying(false)
                        navigate('/freelancer/proposals')
                    }}
                />
            )}
        </div>
    )
}

// Proposal Modal with real API submission
function ProposalModal({ job, onClose, onSuccess }: { job: Job; onClose: () => void; onSuccess: () => void }) {
    const [coverLetter, setCoverLetter] = useState("")
    const [proposedAmount, setProposedAmount] = useState(job.budget.toString())
    const [deliveryDays, setDeliveryDays] = useState("30")
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        setError(null)

        try {
            await JobAPI.submitProposal(job.id, {
                cover_letter: coverLetter,
                proposed_rate: parseFloat(proposedAmount),
                estimated_duration: `${deliveryDays} days`
            })
            onSuccess()
        } catch (err: any) {
            console.error("Failed to submit proposal:", err)
            setError(err.response?.data?.error || "Failed to submit proposal. Please try again.")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl"
            >
                <h2 className="text-xl font-semibold text-white mb-2">Submit Proposal</h2>
                <p className="text-sm text-zinc-400 mb-6">for "{job.title}"</p>

                {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Cover Letter */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                            Cover Letter
                        </label>
                        <textarea
                            value={coverLetter}
                            onChange={(e) => setCoverLetter(e.target.value)}
                            placeholder="Introduce yourself and explain why you're the best fit for this job..."
                            rows={5}
                            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 resize-none"
                            required
                            disabled={submitting}
                        />
                    </div>

                    {/* Proposed Amount */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                            Proposed Amount (SOL)
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">◎</span>
                            <input
                                type="number"
                                value={proposedAmount}
                                onChange={(e) => setProposedAmount(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                required
                                disabled={submitting}
                                min="0"
                                step="0.1"
                            />
                        </div>
                        <p className="text-xs text-zinc-500 mt-1">Client budget: ◎ {job.budget} SOL</p>
                    </div>

                    {/* Delivery Time */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                            Estimated Delivery (days)
                        </label>
                        <input
                            type="number"
                            value={deliveryDays}
                            onChange={(e) => setDeliveryDays(e.target.value)}
                            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                            required
                            disabled={submitting}
                            min="1"
                        />
                    </div>

                    {/* Note */}
                    <p className="text-xs text-zinc-500">
                        No wallet signature required at this stage. You'll only sign when the client hires you.
                    </p>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                            disabled={submitting}
                        >
                            Cancel
                        </Button>
                        <GradientSlideButton
                            type="submit"
                            className="flex-1 rounded-lg"
                            colorFrom="#8B5CF6"
                            colorTo="#EC4899"
                            disabled={submitting}
                        >
                            {submitting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                "Submit Proposal"
                            )}
                        </GradientSlideButton>
                    </div>
                </form>
            </motion.div>
        </div>
    )
}
