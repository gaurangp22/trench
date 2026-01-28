import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/Button"
import { GradientSlideButton } from "@/components/ui/GradientSlideButton"
import {
    ArrowLeft, Shield, CheckCircle, Clock, MessageSquare,
    Loader2, Upload, AlertCircle
} from "lucide-react"
import { ContractAPI, MessageAPI, type Contract, type Milestone } from "@/lib/api"
import { cn } from "@/lib/utils"

export function FreelancerContractDetail() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [contract, setContract] = useState<Contract | null>(null)
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [showSubmitModal, setShowSubmitModal] = useState(false)
    const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null)
    const [submissionNotes, setSubmissionNotes] = useState("")

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

    const handleSubmitMilestone = async () => {
        if (!selectedMilestone) return
        setActionLoading(selectedMilestone.id)
        try {
            await ContractAPI.submitMilestone(selectedMilestone.id, submissionNotes)
            setShowSubmitModal(false)
            setSubmissionNotes("")
            await loadContract()
        } catch (error) {
            console.error("Failed to submit milestone:", error)
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

    const openSubmitModal = (milestone: Milestone) => {
        setSelectedMilestone(milestone)
        setShowSubmitModal(true)
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

    const getEarned = () => {
        if (!contract?.milestones?.length) return 0
        return contract.milestones
            .filter(m => m.status === 'approved')
            .reduce((sum, m) => sum + m.amount, 0)
    }

    const getPending = () => {
        if (!contract?.milestones?.length) return 0
        return contract.milestones
            .filter(m => m.status !== 'approved')
            .reduce((sum, m) => sum + m.amount, 0)
    }

    if (loading) {
        return (
            <DashboardLayout role="freelancer">
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                </div>
            </DashboardLayout>
        )
    }

    if (!contract) {
        return (
            <DashboardLayout role="freelancer">
                <div className="text-center py-20">
                    <h2 className="text-xl text-white mb-4">Contract not found</h2>
                    <Link to="/freelancer/contracts">
                        <Button variant="outline">Back to Contracts</Button>
                    </Link>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout role="freelancer">
            {/* Header */}
            <div className="mb-8">
                <Link
                    to="/freelancer/contracts"
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
                            <span>Started {new Date(contract.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        onClick={handleStartConversation}
                        className="border-white/10"
                    >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Message Client
                    </Button>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Progress */}
                    <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-white">Your Progress</h2>
                            <span className="text-2xl font-bold text-indigo-400">{getProgress()}%</span>
                        </div>
                        <div className="h-3 bg-white/5 rounded-full overflow-hidden">
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
                                        milestone.status === 'in_progress' || milestone.status === 'revision_requested'
                                            ? "bg-indigo-500/5 border-indigo-500/20"
                                            : milestone.status === 'submitted'
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
                                                    : milestone.status === 'in_progress'
                                                    ? "bg-indigo-500 text-white"
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

                                    {/* Revision requested alert */}
                                    {milestone.status === 'revision_requested' && (
                                        <div className="mb-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
                                            <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                                            <div>
                                                <p className="text-sm text-red-400 font-medium">Revision Requested</p>
                                                <p className="text-xs text-red-400/70 mt-1">Please review the client's feedback and resubmit your work.</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Actions for in_progress or revision_requested milestones */}
                                    {(milestone.status === 'in_progress' || milestone.status === 'revision_requested') && (
                                        <div className="pt-3 border-t border-white/5">
                                            <GradientSlideButton
                                                onClick={() => openSubmitModal(milestone)}
                                                className="w-full rounded-lg py-2 text-sm"
                                                colorFrom="#8B5CF6"
                                                colorTo="#EC4899"
                                            >
                                                <Upload className="w-4 h-4 mr-2" />
                                                Submit Work for Review
                                            </GradientSlideButton>
                                        </div>
                                    )}

                                    {/* Submitted state */}
                                    {milestone.status === 'submitted' && (
                                        <div className="pt-3 border-t border-white/5">
                                            <p className="text-sm text-amber-400 flex items-center gap-2">
                                                <Clock className="w-4 h-4" />
                                                Awaiting client approval...
                                            </p>
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
                    {/* Earnings Summary */}
                    <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl p-6">
                        <h2 className="text-lg font-bold text-white mb-4">Earnings</h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between py-3 border-b border-white/5">
                                <span className="text-zinc-400">Total Value</span>
                                <span className="font-bold text-white">◎ {contract.total_amount}</span>
                            </div>
                            <div className="flex items-center justify-between py-3 border-b border-white/5">
                                <span className="text-zinc-400">Earned</span>
                                <span className="font-bold text-indigo-400">◎ {getEarned()}</span>
                            </div>
                            <div className="flex items-center justify-between py-3">
                                <span className="text-zinc-400">Pending</span>
                                <span className="font-bold text-white">◎ {getPending()}</span>
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

                    {/* Client Info */}
                    <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl p-6">
                        <h2 className="text-lg font-bold text-white mb-4">Client</h2>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                                {contract.client?.display_name?.[0] || 'C'}
                            </div>
                            <div>
                                <h3 className="font-medium text-white">
                                    {contract.client?.display_name || 'Client'}
                                </h3>
                                <p className="text-sm text-zinc-400">
                                    {contract.client?.professional_title || 'Client'}
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            className="w-full border-white/10"
                            onClick={handleStartConversation}
                        >
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Send Message
                        </Button>
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

            {/* Submit Work Modal */}
            {showSubmitModal && selectedMilestone && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#0a0a0c] border border-white/10 rounded-2xl p-6 max-w-md w-full">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                                <Upload className="w-6 h-6 text-indigo-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Submit Work</h3>
                                <p className="text-zinc-400 text-sm">{selectedMilestone.title}</p>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-zinc-400 mb-2">
                                Submission Notes (Optional)
                            </label>
                            <textarea
                                value={submissionNotes}
                                onChange={(e) => setSubmissionNotes(e.target.value)}
                                placeholder="Describe what you've completed, include any relevant links or notes..."
                                rows={4}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
                            />
                        </div>

                        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg mb-6">
                            <p className="text-xs text-blue-400">
                                Once submitted, the client will review your work. Payment of ◎ {selectedMilestone.amount} will be released upon approval.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1 border-white/10"
                                onClick={() => {
                                    setShowSubmitModal(false)
                                    setSubmissionNotes("")
                                }}
                            >
                                Cancel
                            </Button>
                            <GradientSlideButton
                                onClick={handleSubmitMilestone}
                                disabled={actionLoading === selectedMilestone.id}
                                className="flex-1 rounded-xl"
                                colorFrom="#8B5CF6"
                                colorTo="#EC4899"
                            >
                                {actionLoading === selectedMilestone.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    "Submit for Review"
                                )}
                            </GradientSlideButton>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    )
}
