import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/Button"
import { GradientSlideButton } from "@/components/ui/GradientSlideButton"
import {
    ArrowLeft, Shield, CheckCircle, Clock, MessageSquare,
    Loader2, Star, ChevronRight, RefreshCw
} from "lucide-react"
import { ContractAPI, MessageAPI, ReviewAPI, type Contract, type Milestone } from "@/lib/api"
import { cn } from "@/lib/utils"

export function ContractDetail() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [contract, setContract] = useState<Contract | null>(null)
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [showRevisionModal, setShowRevisionModal] = useState(false)
    const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null)
    const [revisionFeedback, setRevisionFeedback] = useState("")
    const [showReviewModal, setShowReviewModal] = useState(false)
    const [review, setReview] = useState({ rating: 5, comment: "" })

    useEffect(() => {
        if (id) {
            loadContract()
        }
    }, [id])

    const loadContract = async () => {
        try {
            setLoading(true)
            const data = await ContractAPI.getById(id!)
            setContract(data)
        } catch (error) {
            console.error("Failed to load contract:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleApproveMilestone = async (milestoneId: string) => {
        setActionLoading(milestoneId)
        try {
            await ContractAPI.approveMilestone(milestoneId)
            await loadContract() // Reload to get updated state
        } catch (error) {
            console.error("Failed to approve milestone:", error)
        } finally {
            setActionLoading(null)
        }
    }

    const handleRequestRevision = async () => {
        if (!selectedMilestone || !revisionFeedback.trim()) return
        setActionLoading(selectedMilestone.id)
        try {
            await ContractAPI.requestRevision(selectedMilestone.id, revisionFeedback)
            setShowRevisionModal(false)
            setRevisionFeedback("")
            await loadContract()
        } catch (error) {
            console.error("Failed to request revision:", error)
        } finally {
            setActionLoading(null)
        }
    }

    const handleCompleteContract = async () => {
        if (!contract) return
        setActionLoading('complete')
        try {
            await ContractAPI.complete(contract.id)
            setShowReviewModal(true)
            await loadContract()
        } catch (error) {
            console.error("Failed to complete contract:", error)
        } finally {
            setActionLoading(null)
        }
    }

    const handleStartConversation = async () => {
        if (!contract) return
        try {
            const conversation = await MessageAPI.getContractConversation(contract.id)
            navigate(`/messages?conversation=${conversation.id}`)
        } catch (error) {
            console.error("Failed to start conversation:", error)
        }
    }

    const openRevisionModal = (milestone: Milestone) => {
        setSelectedMilestone(milestone)
        setShowRevisionModal(true)
    }

    const getMilestoneStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
            case 'in_progress': return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
            case 'submitted': return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
            case 'approved': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
            case 'revision_requested': return 'bg-red-500/10 text-red-400 border-red-500/20'
            default: return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
        }
    }

    const getProgress = () => {
        if (!contract?.milestones?.length) return 0
        const approved = contract.milestones.filter(m => m.status === 'approved').length
        return Math.round((approved / contract.milestones.length) * 100)
    }

    const canComplete = () => {
        if (!contract?.milestones?.length) return false
        return contract.milestones.every(m => m.status === 'approved')
    }

    if (loading) {
        return (
            <DashboardLayout role="client">
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                </div>
            </DashboardLayout>
        )
    }

    if (!contract) {
        return (
            <DashboardLayout role="client">
                <div className="text-center py-20">
                    <h2 className="text-xl text-white mb-4">Contract not found</h2>
                    <Link to="/client/contracts">
                        <Button variant="outline">Back to Contracts</Button>
                    </Link>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout role="client">
            {/* Header */}
            <div className="mb-8">
                <Link
                    to="/client/contracts"
                    className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Contracts
                </Link>
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-heading font-bold text-white mb-2">{contract.title}</h1>
                        <div className="flex items-center gap-4 text-sm text-zinc-400">
                            <span className={cn(
                                "px-2 py-0.5 rounded text-xs font-medium border",
                                contract.status === 'active' ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" :
                                contract.status === 'completed' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                                "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                            )}>
                                {contract.status}
                            </span>
                            <span>Created {new Date(contract.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={handleStartConversation}
                            className="border-white/10"
                        >
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Message
                        </Button>
                        {canComplete() && contract.status === 'active' && (
                            <GradientSlideButton
                                onClick={handleCompleteContract}
                                disabled={actionLoading === 'complete'}
                                className="rounded-xl"
                                colorFrom="#6366f1"
                                colorTo="#059669"
                            >
                                {actionLoading === 'complete' ? (
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                ) : (
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                )}
                                Complete Contract
                            </GradientSlideButton>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Progress */}
                    <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-white">Progress</h2>
                            <span className="text-2xl font-bold text-indigo-400">{getProgress()}%</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                                style={{ width: `${getProgress()}%` }}
                            />
                        </div>
                    </div>

                    {/* Milestones */}
                    <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl p-6">
                        <h2 className="text-lg font-bold text-white mb-6">Milestones</h2>
                        <div className="space-y-4">
                            {contract.milestones?.map((milestone, index) => (
                                <div
                                    key={milestone.id}
                                    className={cn(
                                        "p-4 rounded-xl border transition-all",
                                        milestone.status === 'submitted'
                                            ? "bg-amber-500/5 border-amber-500/20"
                                            : "bg-white/5 border-white/5"
                                    )}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                                                milestone.status === 'approved'
                                                    ? "bg-indigo-500 text-white"
                                                    : milestone.status === 'submitted'
                                                    ? "bg-amber-500 text-black"
                                                    : "bg-white/10 text-zinc-400"
                                            )}>
                                                {milestone.status === 'approved' ? (
                                                    <CheckCircle className="w-4 h-4" />
                                                ) : (
                                                    index + 1
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-white">{milestone.title}</h3>
                                                {milestone.description && (
                                                    <p className="text-sm text-zinc-400 mt-1">{milestone.description}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-white">◎ {milestone.amount}</div>
                                            <span className={cn(
                                                "px-2 py-0.5 rounded text-[10px] font-bold uppercase border",
                                                getMilestoneStatusColor(milestone.status)
                                            )}>
                                                {milestone.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions for submitted milestones */}
                                    {milestone.status === 'submitted' && (
                                        <div className="flex items-center gap-3 pt-3 border-t border-white/5">
                                            <GradientSlideButton
                                                onClick={() => handleApproveMilestone(milestone.id)}
                                                disabled={actionLoading === milestone.id}
                                                className="flex-1 rounded-lg py-2 text-sm"
                                                colorFrom="#6366f1"
                                                colorTo="#059669"
                                            >
                                                {actionLoading === milestone.id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <>
                                                        <CheckCircle className="w-4 h-4 mr-2" />
                                                        Approve Milestone
                                                    </>
                                                )}
                                            </GradientSlideButton>
                                            <Button
                                                variant="outline"
                                                onClick={() => openRevisionModal(milestone)}
                                                className="border-amber-500/20 text-amber-400 hover:bg-amber-500/10"
                                            >
                                                <RefreshCw className="w-4 h-4 mr-2" />
                                                Request Revision
                                            </Button>
                                        </div>
                                    )}

                                    {milestone.due_date && (
                                        <div className="flex items-center gap-2 text-xs text-zinc-500 mt-3">
                                            <Clock className="w-3 h-3" />
                                            Due: {new Date(milestone.due_date).toLocaleDateString()}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Contract Summary */}
                    <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl p-6">
                        <h2 className="text-lg font-bold text-white mb-4">Contract Summary</h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between py-3 border-b border-white/5">
                                <span className="text-zinc-400">Total Value</span>
                                <span className="font-bold text-white">◎ {contract.total_amount}</span>
                            </div>
                            <div className="flex items-center justify-between py-3 border-b border-white/5">
                                <span className="text-zinc-400">Milestones</span>
                                <span className="font-bold text-white">{contract.milestones?.length || 0}</span>
                            </div>
                            {contract.escrow_address && (
                                <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                                    <div className="flex items-center gap-2 text-indigo-400 text-sm font-medium">
                                        <Shield className="w-4 h-4" />
                                        Escrow Protected
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Freelancer Info */}
                    <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl p-6">
                        <h2 className="text-lg font-bold text-white mb-4">Freelancer</h2>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center text-white font-bold">
                                {contract.freelancer?.display_name?.[0] || 'F'}
                            </div>
                            <div>
                                <h3 className="font-medium text-white">
                                    {contract.freelancer?.display_name || 'Freelancer'}
                                </h3>
                                <p className="text-sm text-zinc-400">
                                    {contract.freelancer?.professional_title}
                                </p>
                            </div>
                        </div>
                        <Link to={`/talent/${contract.freelancer_id}`}>
                            <Button variant="outline" className="w-full border-white/10">
                                View Profile
                                <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>
                    </div>

                    {/* Description */}
                    {contract.description && (
                        <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl p-6">
                            <h2 className="text-lg font-bold text-white mb-4">Description</h2>
                            <p className="text-zinc-400 text-sm leading-relaxed">{contract.description}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Revision Modal */}
            {showRevisionModal && selectedMilestone && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#0a0a0c] border border-white/10 rounded-2xl p-6 max-w-md w-full">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                                <RefreshCw className="w-6 h-6 text-amber-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Request Revision</h3>
                                <p className="text-zinc-400 text-sm">{selectedMilestone.title}</p>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-zinc-400 mb-2">
                                Feedback for Freelancer
                            </label>
                            <textarea
                                value={revisionFeedback}
                                onChange={(e) => setRevisionFeedback(e.target.value)}
                                placeholder="Explain what needs to be revised..."
                                rows={4}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 resize-none"
                            />
                        </div>

                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1 border-white/10"
                                onClick={() => {
                                    setShowRevisionModal(false)
                                    setRevisionFeedback("")
                                }}
                            >
                                Cancel
                            </Button>
                            <GradientSlideButton
                                onClick={handleRequestRevision}
                                disabled={!revisionFeedback.trim() || actionLoading === selectedMilestone.id}
                                className="flex-1 rounded-xl"
                                colorFrom="#F59E0B"
                                colorTo="#D97706"
                            >
                                {actionLoading === selectedMilestone.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    "Request Revision"
                                )}
                            </GradientSlideButton>
                        </div>
                    </div>
                </div>
            )}

            {/* Review Modal */}
            {showReviewModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#0a0a0c] border border-white/10 rounded-2xl p-6 max-w-md w-full">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                                <Star className="w-6 h-6 text-indigo-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Leave a Review</h3>
                                <p className="text-zinc-400 text-sm">Rate your experience with this freelancer</p>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-zinc-400 mb-3">Rating</label>
                            <div className="flex items-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onClick={() => setReview(prev => ({ ...prev, rating: star }))}
                                        className="transition-transform hover:scale-110"
                                    >
                                        <Star
                                            className={cn(
                                                "w-8 h-8 transition-colors",
                                                star <= review.rating
                                                    ? "text-amber-400 fill-amber-400"
                                                    : "text-zinc-600"
                                            )}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-zinc-400 mb-2">
                                Comment (Optional)
                            </label>
                            <textarea
                                value={review.comment}
                                onChange={(e) => setReview(prev => ({ ...prev, comment: e.target.value }))}
                                placeholder="Share your experience..."
                                rows={4}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
                            />
                        </div>

                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1 border-white/10"
                                onClick={() => {
                                    setShowReviewModal(false)
                                    navigate('/client/contracts')
                                }}
                            >
                                Skip
                            </Button>
                            <GradientSlideButton
                                onClick={async () => {
                                    try {
                                        await ReviewAPI.create({
                                            contract_id: contract.id,
                                            overall_rating: review.rating,
                                            review_text: review.comment || undefined,
                                            is_public: true
                                        })
                                        setShowReviewModal(false)
                                        navigate('/client/contracts')
                                    } catch (error) {
                                        console.error("Failed to submit review:", error)
                                    }
                                }}
                                className="flex-1 rounded-xl"
                                colorFrom="#6366f1"
                                colorTo="#059669"
                            >
                                Submit Review
                            </GradientSlideButton>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    )
}
