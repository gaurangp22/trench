import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/Button"
import { GradientSlideButton } from "@/components/ui/GradientSlideButton"
import {
    ArrowLeft, Star, Shield, CheckCircle, Clock, User,
    MessageSquare, DollarSign, Loader2, UserCheck, X, AlertCircle
} from "lucide-react"
import { JobAPI, ProposalAPI, ContractAPI, type Job, type Proposal } from "@/lib/api"
import { cn } from "@/lib/utils"

export function JobProposals() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [job, setJob] = useState<Job | null>(null)
    const [proposals, setProposals] = useState<Proposal[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [showHireModal, setShowHireModal] = useState(false)
    const [hireProposal, setHireProposal] = useState<Proposal | null>(null)

    useEffect(() => {
        if (id) {
            loadData()
        }
    }, [id])

    const loadData = async () => {
        try {
            setLoading(true)
            const [jobData, proposalsData] = await Promise.all([
                JobAPI.getById(id!),
                JobAPI.getProposals(id!)
            ])
            setJob(jobData)
            setProposals(proposalsData.proposals || [])
            if (proposalsData.proposals?.length > 0) {
                setSelectedProposal(proposalsData.proposals[0])
            }
        } catch (error) {
            console.error("Failed to load data:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleShortlist = async (proposalId: string) => {
        setActionLoading(proposalId)
        try {
            await ProposalAPI.shortlist(proposalId)
            setProposals(prev => prev.map(p =>
                p.id === proposalId ? { ...p, status: 'shortlisted' as const } : p
            ))
        } catch (error) {
            console.error("Failed to shortlist:", error)
        } finally {
            setActionLoading(null)
        }
    }

    const handleReject = async (proposalId: string) => {
        setActionLoading(proposalId)
        try {
            await ProposalAPI.reject(proposalId)
            setProposals(prev => prev.map(p =>
                p.id === proposalId ? { ...p, status: 'rejected' as const } : p
            ))
        } catch (error) {
            console.error("Failed to reject:", error)
        } finally {
            setActionLoading(null)
        }
    }

    const handleHire = async () => {
        if (!hireProposal) return
        setActionLoading(hireProposal.id)
        try {
            await ContractAPI.hire(hireProposal.id)
            setShowHireModal(false)
            // Navigate to contracts page or show success
            navigate('/client/contracts')
        } catch (error) {
            console.error("Failed to hire:", error)
            alert("Failed to create contract. Please try again.")
        } finally {
            setActionLoading(null)
        }
    }

    const openHireModal = (proposal: Proposal) => {
        setHireProposal(proposal)
        setShowHireModal(true)
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
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                </div>
            </DashboardLayout>
        )
    }

    if (!job) {
        return (
            <DashboardLayout role="client">
                <div className="text-center py-20">
                    <h2 className="text-xl text-white mb-4">Job not found</h2>
                    <Link to="/client/jobs">
                        <Button variant="outline">Back to Jobs</Button>
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
                    to="/client/jobs"
                    className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Jobs
                </Link>
                <h1 className="text-3xl font-heading font-bold text-white mb-2">{job.title}</h1>
                <div className="flex items-center gap-4 text-sm text-zinc-400">
                    <span>◎ {job.budget} {job.budget_type === 'fixed' ? 'Fixed' : '/hr'}</span>
                    <span>•</span>
                    <span>{proposals.length} proposals</span>
                    <span>•</span>
                    <span className={cn(
                        "px-2 py-0.5 rounded text-xs font-medium",
                        job.status === 'open' ? "bg-emerald-500/10 text-emerald-400" : "bg-zinc-500/10 text-zinc-400"
                    )}>
                        {job.status}
                    </span>
                </div>
            </div>

            {proposals.length === 0 ? (
                <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl p-12 text-center">
                    <User className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No proposals yet</h3>
                    <p className="text-zinc-400 max-w-md mx-auto">
                        Your job posting is live. Freelancers will start submitting proposals soon.
                    </p>
                </div>
            ) : (
                <div className="flex gap-6">
                    {/* Proposals List */}
                    <div className="w-96 space-y-3 flex-shrink-0">
                        {proposals.map((proposal) => (
                            <button
                                key={proposal.id}
                                onClick={() => setSelectedProposal(proposal)}
                                className={cn(
                                    "w-full p-4 rounded-xl border text-left transition-all",
                                    selectedProposal?.id === proposal.id
                                        ? "bg-indigo-500/10 border-indigo-500/30"
                                        : "bg-[#0a0a0c] border-white/5 hover:border-white/10"
                                )}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                                        {proposal.freelancer?.display_name?.[0] || 'F'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-medium text-white truncate">
                                                {proposal.freelancer?.display_name || 'Freelancer'}
                                            </span>
                                            {proposal.status === 'shortlisted' && (
                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400">
                                                    Shortlisted
                                                </span>
                                            )}
                                            {proposal.status === 'rejected' && (
                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-400">
                                                    Rejected
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-zinc-500">
                                            <span>◎ {proposal.proposed_rate}</span>
                                            <span>•</span>
                                            <span>{proposal.estimated_duration}</span>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Proposal Detail */}
                    {selectedProposal && (
                        <div className="flex-1 bg-[#0a0a0c] border border-white/5 rounded-2xl p-6">
                            {/* Freelancer Info */}
                            <div className="flex items-start justify-between mb-6 pb-6 border-b border-white/5">
                                <div className="flex items-start gap-4">
                                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold">
                                        {selectedProposal.freelancer?.display_name?.[0] || 'F'}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white mb-1">
                                            {selectedProposal.freelancer?.display_name || 'Freelancer'}
                                        </h2>
                                        <p className="text-zinc-400 text-sm mb-2">
                                            {selectedProposal.freelancer?.professional_title || 'Professional'}
                                        </p>
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="flex items-center gap-1 text-amber-400">
                                                <Star className="w-4 h-4 fill-current" />
                                                <span>4.9</span>
                                            </div>
                                            <span className="text-zinc-600">•</span>
                                            <span className="text-zinc-400">12 jobs completed</span>
                                        </div>
                                    </div>
                                </div>
                                <Link to={`/talent/${selectedProposal.freelancer_id}`}>
                                    <Button variant="outline" size="sm" className="border-white/10">
                                        View Profile
                                    </Button>
                                </Link>
                            </div>

                            {/* Proposal Details */}
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="p-4 bg-white/5 rounded-xl">
                                    <div className="flex items-center gap-2 text-zinc-400 text-sm mb-1">
                                        <DollarSign className="w-4 h-4" />
                                        <span>Proposed Rate</span>
                                    </div>
                                    <div className="text-xl font-bold text-white">◎ {selectedProposal.proposed_rate}</div>
                                </div>
                                <div className="p-4 bg-white/5 rounded-xl">
                                    <div className="flex items-center gap-2 text-zinc-400 text-sm mb-1">
                                        <Clock className="w-4 h-4" />
                                        <span>Duration</span>
                                    </div>
                                    <div className="text-xl font-bold text-white">{selectedProposal.estimated_duration}</div>
                                </div>
                                <div className="p-4 bg-white/5 rounded-xl">
                                    <div className="flex items-center gap-2 text-zinc-400 text-sm mb-1">
                                        <Shield className="w-4 h-4" />
                                        <span>Submitted</span>
                                    </div>
                                    <div className="text-xl font-bold text-white">{formatDate(selectedProposal.created_at)}</div>
                                </div>
                            </div>

                            {/* Cover Letter */}
                            <div className="mb-6">
                                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3">Cover Letter</h3>
                                <div className="p-4 bg-white/5 rounded-xl">
                                    <p className="text-zinc-300 whitespace-pre-wrap leading-relaxed">
                                        {selectedProposal.cover_letter}
                                    </p>
                                </div>
                            </div>

                            {/* Actions */}
                            {(selectedProposal.status === 'pending' || selectedProposal.status === 'submitted') && (
                                <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                                    <GradientSlideButton
                                        onClick={() => openHireModal(selectedProposal)}
                                        className="flex-1 rounded-xl py-3"
                                        colorFrom="#8B5CF6"
                                        colorTo="#EC4899"
                                        disabled={actionLoading === selectedProposal.id}
                                    >
                                        <UserCheck className="w-4 h-4 mr-2" />
                                        Hire Freelancer
                                    </GradientSlideButton>
                                    <Button
                                        variant="outline"
                                        onClick={() => handleShortlist(selectedProposal.id)}
                                        disabled={actionLoading === selectedProposal.id}
                                        className="border-amber-500/20 text-amber-400 hover:bg-amber-500/10"
                                    >
                                        {actionLoading === selectedProposal.id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <>
                                                <Star className="w-4 h-4 mr-2" />
                                                Shortlist
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => handleReject(selectedProposal.id)}
                                        disabled={actionLoading === selectedProposal.id}
                                        className="border-red-500/20 text-red-400 hover:bg-red-500/10"
                                    >
                                        <X className="w-4 h-4 mr-2" />
                                        Reject
                                    </Button>
                                </div>
                            )}

                            {selectedProposal.status === 'shortlisted' && (
                                <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                                    <GradientSlideButton
                                        onClick={() => openHireModal(selectedProposal)}
                                        className="flex-1 rounded-xl py-3"
                                        colorFrom="#8B5CF6"
                                        colorTo="#EC4899"
                                    >
                                        <UserCheck className="w-4 h-4 mr-2" />
                                        Hire Freelancer
                                    </GradientSlideButton>
                                    <Button
                                        variant="outline"
                                        className="border-white/10"
                                    >
                                        <MessageSquare className="w-4 h-4 mr-2" />
                                        Message
                                    </Button>
                                </div>
                            )}

                            {selectedProposal.status === 'rejected' && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                                    <p className="text-red-400 text-sm">This proposal has been rejected.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Hire Modal */}
            {showHireModal && hireProposal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#0a0a0c] border border-white/10 rounded-2xl p-6 max-w-md w-full">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-emerald-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Hire Freelancer</h3>
                                <p className="text-zinc-400 text-sm">Create a contract with this freelancer</p>
                            </div>
                        </div>

                        <div className="p-4 bg-white/5 rounded-xl mb-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                                    {hireProposal.freelancer?.display_name?.[0] || 'F'}
                                </div>
                                <div>
                                    <div className="font-medium text-white">
                                        {hireProposal.freelancer?.display_name || 'Freelancer'}
                                    </div>
                                    <div className="text-xs text-zinc-400">
                                        {hireProposal.freelancer?.professional_title}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between text-sm pt-3 border-t border-white/5">
                                <span className="text-zinc-400">Proposed Rate</span>
                                <span className="font-bold text-white">◎ {hireProposal.proposed_rate}</span>
                            </div>
                        </div>

                        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl mb-6">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                                <p className="text-sm text-amber-200">
                                    A contract will be created and you'll need to fund the escrow before work can begin.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1 border-white/10"
                                onClick={() => setShowHireModal(false)}
                            >
                                Cancel
                            </Button>
                            <GradientSlideButton
                                onClick={handleHire}
                                disabled={actionLoading === hireProposal.id}
                                className="flex-1 rounded-xl"
                                colorFrom="#10B981"
                                colorTo="#059669"
                            >
                                {actionLoading === hireProposal.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    "Confirm & Create Contract"
                                )}
                            </GradientSlideButton>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    )
}
