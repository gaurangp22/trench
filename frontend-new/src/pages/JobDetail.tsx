import { useState, useEffect, useRef } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { ArrowLeft, Star, Shield, CheckCircle, Clock, MapPin, MessageSquare, Loader2, Briefcase, Users, Zap } from "lucide-react"
import { motion, useInView } from "framer-motion"
import { Button } from "@/components/ui/Button"
import { GradientSlideButton } from "@/components/ui/GradientSlideButton"
import { useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { cn } from "@/lib/utils"
import { JobAPI, AuthAPI, MessageAPI, type Job } from "@/lib/api"

export function JobDetail() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { connected } = useWallet()
    const [isApplying, setIsApplying] = useState(false)
    const [job, setJob] = useState<Job | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const contentRef = useRef<HTMLDivElement>(null)
    useInView(contentRef, { once: true })

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

    // TEST MODE: Skip wallet requirement for testing
    const TEST_MODE = true

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
        // Skip wallet check in TEST_MODE
        if (!TEST_MODE && !connected) {
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

    const handleMessageClient = async () => {
        if (!isLoggedIn) {
            navigate('/auth')
            return
        }
        if (!job?.client?.id) return
        try {
            const conversation = await MessageAPI.createConversation({
                participant_id: job.client.id
            })
            navigate(`/messages?conversation=${conversation.id}`)
        } catch (err) {
            // If conversation already exists, navigate to messages
            navigate('/messages')
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#020204] pt-24 pb-20">
                {/* Hero Header Skeleton */}
                <div className="relative overflow-hidden border-b border-white/[0.06]">
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[150px]" />
                    </div>
                    <div className="container max-w-6xl mx-auto px-6 py-12 relative z-10">
                        <div className="h-4 w-24 bg-white/[0.06] rounded mb-8 animate-pulse" />
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                            <div className="flex-1">
                                <div className="h-6 w-32 bg-indigo-500/10 rounded-full mb-4 animate-pulse" />
                                <div className="h-12 w-3/4 bg-white/[0.06] rounded-lg mb-4 animate-pulse" />
                                <div className="flex gap-4">
                                    <div className="h-8 w-32 bg-white/[0.06] rounded-full animate-pulse" />
                                    <div className="h-8 w-24 bg-white/[0.06] rounded-full animate-pulse" />
                                </div>
                            </div>
                            <div className="lg:w-72 p-6 rounded-2xl bg-[#0a0a0c] border border-white/[0.08]">
                                <div className="h-4 w-16 bg-white/[0.06] rounded mb-2 animate-pulse" />
                                <div className="h-10 w-24 bg-white/[0.06] rounded-lg mb-1 animate-pulse" />
                                <div className="h-4 w-20 bg-white/[0.06] rounded animate-pulse" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Skeleton */}
                <div className="container max-w-6xl mx-auto px-6 py-12">
                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            <div className="rounded-2xl border border-white/[0.06] bg-[#0a0a0c] p-6">
                                <div className="h-6 w-40 bg-white/[0.06] rounded mb-6 animate-pulse" />
                                <div className="space-y-3">
                                    <div className="h-4 w-full bg-white/[0.06] rounded animate-pulse" />
                                    <div className="h-4 w-5/6 bg-white/[0.06] rounded animate-pulse" />
                                    <div className="h-4 w-4/5 bg-white/[0.06] rounded animate-pulse" />
                                    <div className="h-4 w-3/4 bg-white/[0.06] rounded animate-pulse" />
                                </div>
                            </div>
                            <div className="rounded-2xl border border-white/[0.06] bg-[#0a0a0c] p-6">
                                <div className="h-6 w-32 bg-white/[0.06] rounded mb-6 animate-pulse" />
                                <div className="flex gap-2">
                                    {[...Array(4)].map((_, i) => (
                                        <div key={i} className="h-10 w-24 bg-white/[0.06] rounded-xl animate-pulse" />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="lg:col-span-1">
                            <div className="rounded-2xl border border-white/[0.06] bg-[#0a0a0c] p-6">
                                <div className="h-12 w-full bg-white/[0.06] rounded-xl mb-6 animate-pulse" />
                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    <div className="h-20 bg-white/[0.06] rounded-xl animate-pulse" />
                                    <div className="h-20 bg-white/[0.06] rounded-xl animate-pulse" />
                                </div>
                                <div className="h-12 w-full bg-indigo-500/20 rounded-xl animate-pulse" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (error || !job) {
        return (
            <div className="min-h-screen bg-[#020204] pt-24 pb-20">
                <div className="container max-w-lg mx-auto px-6 text-center py-20">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4 }}
                        className="bg-[#0a0a0c] border border-white/[0.06] rounded-3xl p-10"
                    >
                        <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
                            <Briefcase className="w-10 h-10 text-red-400" />
                        </div>
                        <h2 className="text-2xl font-heading font-bold text-white mb-3">Job not found</h2>
                        <p className="text-zinc-400 mb-8 leading-relaxed">
                            {error || "This job may have been removed, filled, or the link might be incorrect."}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Link to="/jobs">
                                <GradientSlideButton
                                    className="h-12 px-8 rounded-xl w-full sm:w-auto"
                                    colorFrom="#6366f1"
                                    colorTo="#8b5cf6"
                                >
                                    Browse All Jobs
                                </GradientSlideButton>
                            </Link>
                            <button
                                onClick={() => navigate(-1)}
                                className="h-12 px-6 rounded-xl border border-white/10 text-zinc-300 hover:bg-white/[0.03] transition-all"
                            >
                                Go Back
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#020204] pt-24 pb-20">
            {/* Hero Header */}
            <div className="relative overflow-hidden border-b border-white/[0.06]">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[150px]" />
                    <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-[120px]" />
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
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-4">
                                <Briefcase className="w-3.5 h-3.5" />
                                Web3 Development
                            </div>

                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-white mb-4 leading-tight">
                                {job.title}
                            </h1>

                            {/* Meta Info */}
                            <div className="flex flex-wrap items-center gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-400 flex items-center justify-center text-white text-xs font-bold">
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
                        initial={{ opacity: 1, y: 0 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        {/* Description Card */}
                        <div className="rounded-2xl border border-white/[0.06] bg-[#0a0a0c] overflow-hidden">
                            <div className="px-6 py-4 border-b border-white/[0.06]">
                                <h2 className="text-lg font-semibold text-white">Job Description</h2>
                            </div>
                            <div className="p-6">
                                <div className="prose prose-invert prose-sm max-w-none">
                                    {(job.description || 'No description provided').split('\n').map((line, i) => (
                                        <p key={i} className="text-zinc-400 leading-relaxed mb-3">
                                            {line.startsWith('**') ? (
                                                <strong className="text-white font-medium">
                                                    {line.replace(/\*\*/g, '')}
                                                </strong>
                                            ) : line.startsWith('- ') ? (
                                                <span className="flex items-start gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 flex-shrink-0" />
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
                                animate={{ opacity: 1, y: 0 }}
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
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                                                className="px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-sm text-indigo-300 font-medium hover:bg-indigo-500/20 transition-colors"
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
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="rounded-2xl border border-white/[0.06] bg-[#0a0a0c] overflow-hidden"
                        >
                            <div className="px-6 py-4 border-b border-white/[0.06]">
                                <h2 className="text-lg font-semibold text-white">About the Client</h2>
                            </div>
                            <div className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-400 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-indigo-500/20">
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
                        initial={{ opacity: 1, x: 0 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="sticky top-24 rounded-2xl border border-white/[0.06] bg-[#0a0a0c] overflow-hidden">
                            {/* Gradient Top Line */}
                            <div className="h-1 bg-gradient-to-r from-indigo-500 via-violet-400 to-indigo-500" />

                            <div className="p-6">
                                {/* Escrow Status */}
                                <div className={cn(
                                    "flex items-center justify-center gap-2 py-3 px-4 rounded-xl mb-6",
                                    job.escrow_funded
                                        ? "bg-indigo-500/10 border border-indigo-500/20"
                                        : "bg-white/[0.02] border border-white/[0.06]"
                                )}>
                                    <Shield className={cn(
                                        "w-5 h-5",
                                        job.escrow_funded ? "text-indigo-400" : "text-zinc-500"
                                    )} />
                                    <span className={cn(
                                        "text-sm font-medium",
                                        job.escrow_funded ? "text-indigo-400" : "text-zinc-500"
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
                                    <WalletMultiButton className="!w-full !h-12 !justify-center !bg-gradient-to-r from-indigo-500 to-violet-400 !rounded-xl !font-medium" />
                                ) : (
                                    <GradientSlideButton
                                        onClick={ctaConfig.action}
                                        className="w-full h-12 text-base font-semibold rounded-xl"
                                        colorFrom="#6366f1"
                                        colorTo="#8b5cf6"
                                    >
                                        {ctaConfig.label}
                                    </GradientSlideButton>
                                )}

                                {!isLoggedIn && (
                                    <p className="text-xs text-zinc-500 text-center mt-4">
                                        Already have an account?{" "}
                                        <Link to="/auth" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                                            Log in
                                        </Link>
                                    </p>
                                )}

                                {/* Message Option */}
                                <div className="mt-6 pt-6 border-t border-white/[0.06]">
                                    <button
                                        onClick={handleMessageClient}
                                        className="w-full flex items-center justify-center gap-2 py-3 text-sm text-zinc-400 hover:text-white rounded-xl hover:bg-white/[0.02] transition-all group"
                                    >
                                        <MessageSquare className="w-4 h-4 group-hover:scale-110 transition-transform" />
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
    const [success, setSuccess] = useState(false)

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
            setSuccess(true)
            setTimeout(() => {
                onSuccess()
            }, 1500)
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
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative w-full max-w-lg bg-[#0a0a0c] border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/50 overflow-hidden"
            >
                {/* Success State */}
                {success ? (
                    <div className="p-10 text-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", damping: 15, stiffness: 300 }}
                            className="w-20 h-20 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center mx-auto mb-6"
                        >
                            <CheckCircle className="w-10 h-10 text-indigo-400" />
                        </motion.div>
                        <h3 className="text-2xl font-bold text-white mb-2">Proposal Submitted!</h3>
                        <p className="text-zinc-400">Your proposal has been sent to the client. You'll be notified when they respond.</p>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="px-6 pt-6 pb-4 border-b border-white/[0.06]">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-white mb-1">Submit Proposal</h2>
                                    <p className="text-sm text-zinc-400 truncate max-w-[280px]">for "{job.title}"</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-all"
                                >
                                    <span className="sr-only">Close</span>
                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                        <path d="M1 1l12 12M13 1L1 13" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                    {error}
                                </motion.div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Cover Letter */}
                                <div>
                                    <label className="flex items-center justify-between text-sm font-medium text-zinc-300 mb-2">
                                        <span>Cover Letter</span>
                                        <span className="text-xs text-zinc-500">{coverLetter.length}/1000</span>
                                    </label>
                                    <textarea
                                        value={coverLetter}
                                        onChange={(e) => setCoverLetter(e.target.value.slice(0, 1000))}
                                        placeholder="Introduce yourself and explain why you're the best fit for this job..."
                                        rows={5}
                                        className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 resize-none transition-all"
                                        required
                                        disabled={submitting}
                                    />
                                </div>

                                {/* Amount and Duration Row */}
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Proposed Amount */}
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                                            Your Bid (SOL)
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 font-medium">◎</span>
                                            <input
                                                type="number"
                                                value={proposedAmount}
                                                onChange={(e) => setProposedAmount(e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                                required
                                                disabled={submitting}
                                                min="0"
                                                step="0.1"
                                            />
                                        </div>
                                        <p className="text-xs text-zinc-500 mt-1.5">Budget: ◎ {job.budget}</p>
                                    </div>

                                    {/* Delivery Time */}
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                                            Delivery (days)
                                        </label>
                                        <input
                                            type="number"
                                            value={deliveryDays}
                                            onChange={(e) => setDeliveryDays(e.target.value)}
                                            className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                            required
                                            disabled={submitting}
                                            min="1"
                                        />
                                        <p className="text-xs text-zinc-500 mt-1.5">Estimated time</p>
                                    </div>
                                </div>

                                {/* Info Note */}
                                <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                                    <p className="text-xs text-blue-400 flex items-start gap-2">
                                        <Shield className="w-4 h-4 shrink-0 mt-0.5" />
                                        <span>No wallet signature required now. You'll only sign when hired and funds are escrowed.</span>
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 pt-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={onClose}
                                        className="flex-1 h-12 border-white/10 text-zinc-300 hover:bg-white/[0.03] rounded-xl"
                                        disabled={submitting}
                                    >
                                        Cancel
                                    </Button>
                                    <GradientSlideButton
                                        type="submit"
                                        className="flex-1 h-12 rounded-xl font-semibold"
                                        colorFrom="#6366f1"
                                        colorTo="#8b5cf6"
                                        disabled={submitting || !coverLetter.trim()}
                                    >
                                        {submitting ? (
                                            <span className="flex items-center gap-2">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Submitting...
                                            </span>
                                        ) : (
                                            "Submit Proposal"
                                        )}
                                    </GradientSlideButton>
                                </div>
                            </form>
                        </div>
                    </>
                )}
            </motion.div>
        </div>
    )
}
