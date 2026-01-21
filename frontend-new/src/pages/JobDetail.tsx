import { useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { ArrowLeft, Star, Shield, CheckCircle, Clock, MapPin, MessageSquare } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { cn } from "@/lib/utils"

// Mock job data - in production, fetch from API
const MOCK_JOB = {
    id: 1,
    title: "Senior Smart Contract Engineer",
    description: `We're looking for an experienced Smart Contract Engineer to join our DeFi protocol team. You'll be responsible for designing, implementing, and auditing Solana smart contracts using Rust and Anchor.

**Responsibilities:**
- Design and implement secure smart contracts for our lending protocol
- Conduct code reviews and security audits
- Write comprehensive tests and documentation
- Collaborate with frontend team on integration
- Participate in protocol design discussions

**Requirements:**
- 3+ years experience with Rust
- Strong understanding of Solana ecosystem
- Experience with Anchor framework
- Knowledge of DeFi protocols and tokenomics
- Security-first mindset`,
    company: "DeFi Protocol X",
    clientRating: 4.9,
    clientJobs: 12,
    clientVerified: true,
    type: "Fixed Price",
    location: "Remote",
    budgetSol: 175,
    budgetMin: 150,
    budgetMax: 200,
    budgetInr: "₹12,50,000", // Estimated INR
    posted: "2 hours ago",
    deadline: "Open",
    skills: ["Solana", "Rust", "Anchor", "DeFi", "Smart Contracts"],
    escrowStatus: "funded" as "funded" | "not_funded",
    experienceLevel: "Expert",
    estimatedDuration: "2-3 months",
    proposalsCount: 8,
    hiredCount: 0,
}

export function JobDetail() {
    const { id: _jobId } = useParams()
    const navigate = useNavigate()
    const { connected, publicKey: _publicKey } = useWallet()
    const [isApplying, setIsApplying] = useState(false)

    // Mock auth state - in real app, get from auth context
    const isLoggedIn = false
    const job = MOCK_JOB

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
                action: () => { }, // Wallet button handles this
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

    return (
        <div className="min-h-screen bg-background pt-20 pb-20">
            <div className="container max-w-5xl mx-auto px-6">
                {/* Back Button */}
                <Link
                    to="/jobs"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Jobs
                </Link>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Header */}
                        <div>
                            <div className="flex items-start gap-4 mb-4">
                                <h1 className="text-3xl md:text-4xl font-semibold text-foreground italic-expressive">
                                    {job.title}
                                </h1>
                            </div>

                            {/* Company & Meta */}
                            <div className="flex flex-wrap items-center gap-4 text-sm">
                                <span className="flex items-center gap-1.5">
                                    <span className="font-medium text-foreground">{job.company}</span>
                                    {job.clientVerified && (
                                        <CheckCircle className="w-4 h-4 text-blue-400" />
                                    )}
                                </span>
                                <span className="flex items-center gap-1 text-amber-400">
                                    <Star className="w-4 h-4 fill-current" />
                                    <span className="font-medium">{job.clientRating}</span>
                                    <span className="text-muted-foreground">({job.clientJobs} jobs)</span>
                                </span>
                                <span className="flex items-center gap-1.5 text-muted-foreground">
                                    <MapPin className="w-4 h-4" />
                                    {job.location}
                                </span>
                                <span className="flex items-center gap-1.5 text-muted-foreground">
                                    <Clock className="w-4 h-4" />
                                    Posted {job.posted}
                                </span>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="glass-card rounded-2xl p-6 border border-white/5">
                            <h2 className="text-lg font-semibold text-foreground mb-4">Job Description</h2>
                            <div className="prose prose-invert prose-sm max-w-none">
                                {job.description.split('\n').map((line, i) => (
                                    <p key={i} className="text-muted-foreground leading-relaxed mb-2">
                                        {line.startsWith('**') ? (
                                            <strong className="text-foreground">
                                                {line.replace(/\*\*/g, '')}
                                            </strong>
                                        ) : line.startsWith('- ') ? (
                                            <span className="block pl-4">• {line.slice(2)}</span>
                                        ) : (
                                            line
                                        )}
                                    </p>
                                ))}
                            </div>
                        </div>

                        {/* Skills */}
                        <div className="glass-card rounded-2xl p-6 border border-white/5">
                            <h2 className="text-lg font-semibold text-foreground mb-4">Required Skills</h2>
                            <div className="flex flex-wrap gap-2">
                                {job.skills.map((skill) => (
                                    <span
                                        key={skill}
                                        className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-foreground hover:bg-white/10 transition-colors"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Client Info */}
                        <div className="glass-card rounded-2xl p-6 border border-white/5">
                            <h2 className="text-lg font-semibold text-foreground mb-4">About the Client</h2>
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold shadow-lg">
                                    {job.company[0]}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium text-foreground">{job.company}</span>
                                        {job.clientVerified && (
                                            <span className="flex items-center gap-1 text-xs text-blue-400">
                                                <CheckCircle className="w-3 h-3" />
                                                Verified
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
                                            {job.clientRating} rating
                                        </span>
                                        <span>{job.clientJobs} jobs posted</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar - Apply Card */}
                    <div className="lg:col-span-1">
                        <div className="glass-card rounded-2xl p-6 sticky top-24 border border-white/5 shadow-2xl shadow-primary/5">
                            {/* Budget */}
                            <div className="text-center mb-6 pb-6 border-b border-white/10">
                                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Budget</div>
                                <div className="text-3xl font-bold text-foreground mb-1">
                                    ◎ {job.budgetMin === job.budgetMax ? job.budgetSol : `${job.budgetMin} - ${job.budgetMax}`}
                                    <span className="text-lg text-muted-foreground ml-1">SOL</span>
                                </div>
                                <div className="text-sm text-muted-foreground">≈ {job.budgetInr}</div>
                            </div>

                            {/* Escrow Status */}
                            <div className={cn(
                                "flex items-center justify-center gap-2 py-3 px-4 rounded-xl mb-6",
                                job.escrowStatus === "funded"
                                    ? "bg-emerald-500/10 border border-emerald-500/20"
                                    : "bg-white/5 border border-white/10"
                            )}>
                                <Shield className={cn(
                                    "w-5 h-5",
                                    job.escrowStatus === "funded" ? "text-emerald-400" : "text-muted-foreground"
                                )} />
                                <span className={cn(
                                    "text-sm font-medium",
                                    job.escrowStatus === "funded" ? "text-emerald-400" : "text-muted-foreground"
                                )}>
                                    {job.escrowStatus === "funded" ? "Escrow Funded" : "Escrow Not Yet Funded"}
                                </span>
                            </div>

                            {/* Escrow Tooltip */}
                            {job.escrowStatus === "funded" && (
                                <p className="text-xs text-muted-foreground text-center mb-6">
                                    💡 Funds are secured on-chain. Payment is released when work is approved.
                                </p>
                            )}

                            {/* Job Stats */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="text-center p-3 bg-white/5 rounded-xl">
                                    <div className="text-lg font-semibold text-foreground">{job.proposalsCount}</div>
                                    <div className="text-xs text-muted-foreground">Proposals</div>
                                </div>
                                <div className="text-center p-3 bg-white/5 rounded-xl">
                                    <div className="text-lg font-semibold text-foreground">{job.estimatedDuration}</div>
                                    <div className="text-xs text-muted-foreground">Duration</div>
                                </div>
                            </div>

                            {/* Progressive CTA */}
                            {ctaConfig.variant === "wallet" ? (
                                <WalletMultiButton className="!w-full !h-12 !justify-center !bg-gradient-to-r from-purple-500 to-pink-500 !rounded-full !font-medium" />
                            ) : (
                                <Button
                                    onClick={ctaConfig.action}
                                    variant={ctaConfig.variant === "primary" ? "premium" : "outline"}
                                    className="w-full h-12 text-base font-medium rounded-full"
                                >
                                    {ctaConfig.label}
                                </Button>
                            )}

                            {/* Helper Text */}
                            {!isLoggedIn && (
                                <p className="text-xs text-muted-foreground text-center mt-4">
                                    Already have an account? <Link to="/auth" className="text-primary hover:underline">Log in</Link>
                                </p>
                            )}

                            {/* Message Client Option */}
                            <div className="mt-4 pt-4 border-t border-white/10">
                                <button className="w-full flex items-center justify-center gap-2 py-2.5 text-sm text-muted-foreground hover:text-white transition-colors">
                                    <MessageSquare className="w-4 h-4" />
                                    Message Client
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Proposal Modal would go here */}
            {isApplying && (
                <ProposalModal
                    job={job}
                    onClose={() => setIsApplying(false)}
                />
            )}
        </div>
    )
}

// Simple Proposal Modal
function ProposalModal({ job, onClose }: { job: any; onClose: () => void }) {
    const [coverLetter, setCoverLetter] = useState("")
    const [proposedAmount, setProposedAmount] = useState(job.budgetSol.toString())
    const [deliveryDays, setDeliveryDays] = useState("30")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // In production, submit proposal to backend
        console.log({ coverLetter, proposedAmount, deliveryDays })
        onClose()
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
                <h2 className="text-xl font-semibold text-white mb-6">Submit Proposal</h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Cover Letter */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                            Cover Letter
                        </label>
                        <textarea
                            value={coverLetter}
                            onChange={(e) => setCoverLetter(e.target.value)}
                            placeholder="Why are you the best fit for this job?"
                            rows={5}
                            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 resize-none"
                            required
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
                            />
                        </div>
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
                        />
                    </div>

                    {/* Note */}
                    <p className="text-xs text-zinc-500">
                        💡 No wallet signature required at this stage. You'll only sign when the client hires you.
                    </p>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
                        >
                            Submit Proposal
                        </Button>
                    </div>
                </form>
            </motion.div>
        </div>
    )
}
