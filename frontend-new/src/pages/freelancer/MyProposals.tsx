import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/Button"
import { motion } from "framer-motion"
import {
    Loader2, Search, MessageSquare, User, FileText,
    Clock, Eye, X
} from "lucide-react"
import { ProposalAPI, type Proposal } from "@/lib/api"
import { cn } from "@/lib/utils"

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    pending: { label: "Pending", color: "text-amber-400", bg: "bg-amber-500/10" },
    submitted: { label: "Submitted", color: "text-amber-400", bg: "bg-amber-500/10" },
    viewed: { label: "Viewed", color: "text-blue-400", bg: "bg-blue-500/10" },
    shortlisted: { label: "Shortlisted", color: "text-purple-400", bg: "bg-purple-500/10" },
    accepted: { label: "Accepted", color: "text-indigo-400", bg: "bg-indigo-500/10" },
    hired: { label: "Hired", color: "text-indigo-400", bg: "bg-indigo-500/10" },
    rejected: { label: "Rejected", color: "text-red-400", bg: "bg-red-500/10" },
    withdrawn: { label: "Withdrawn", color: "text-zinc-400", bg: "bg-zinc-500/10" },
}

type FilterType = 'all' | 'active' | 'archived'

export function MyProposals() {
    const [proposals, setProposals] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<FilterType>('all')
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        const loadProposals = async () => {
            setLoading(true)
            try {
                const data = await ProposalAPI.getMyProposals()
                const mapped = (data.proposals || []).map((p: Proposal) => ({
                    id: p.id,
                    jobTitle: p.job?.title || "Unknown Job",
                    client: p.job?.client?.display_name || "Unknown Client",
                    clientId: p.job?.client?.id,
                    sent: new Date(p.created_at).toLocaleDateString(),
                    status: p.status,
                    bid: p.proposed_rate,
                    jobId: p.job_id
                }))
                setProposals(mapped)
            } catch (error) {
                console.error("Failed to load proposals:", error)
            } finally {
                setLoading(false)
            }
        }
        loadProposals()
    }, [])

    const filteredProposals = proposals
        .filter(p => {
            if (filter === 'active') return !['rejected', 'withdrawn'].includes(p.status)
            if (filter === 'archived') return ['rejected', 'withdrawn'].includes(p.status)
            return true
        })
        .filter(p => {
            if (!searchQuery) return true
            return p.jobTitle.toLowerCase().includes(searchQuery.toLowerCase())
        })

    const getCounts = () => ({
        all: proposals.length,
        active: proposals.filter(p => !['rejected', 'withdrawn'].includes(p.status)).length,
        archived: proposals.filter(p => ['rejected', 'withdrawn'].includes(p.status)).length,
    })

    const counts = getCounts()

    const handleWithdraw = async (proposalId: string) => {
        if (!confirm("Are you sure you want to withdraw this proposal?")) return
        try {
            await ProposalAPI.withdraw(proposalId)
            setProposals(prev => prev.map(p =>
                p.id === proposalId ? { ...p, status: 'withdrawn' } : p
            ))
        } catch (error) {
            console.error("Failed to withdraw:", error)
            alert("Failed to withdraw proposal")
        }
    }

    return (
        <DashboardLayout role="freelancer">
            <div className="space-y-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
                >
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-1">My Proposals</h1>
                        <p className="text-zinc-400">Track and manage your job applications</p>
                    </div>
                    <Link to="/jobs">
                        <Button className="h-11 px-5 rounded-xl bg-white text-black hover:bg-zinc-100 font-semibold">
                            <Search className="w-4 h-4 mr-2" />
                            Find Jobs
                        </Button>
                    </Link>
                </motion.div>

                {/* Filters & Search */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4"
                >
                    {/* Filter Tabs */}
                    <div className="flex items-center gap-1 p-1 bg-white/[0.02] rounded-xl border border-white/[0.06]">
                        {(['all', 'active', 'archived'] as FilterType[]).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize",
                                    filter === f
                                        ? "bg-white/10 text-white"
                                        : "text-zinc-500 hover:text-zinc-300"
                                )}
                            >
                                {f}
                                <span className="ml-1.5 text-xs text-zinc-600">
                                    ({counts[f]})
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                            type="text"
                            placeholder="Search proposals..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full sm:w-64 h-10 bg-white/[0.02] border border-white/[0.06] rounded-xl pl-10 pr-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/20 transition-colors"
                        />
                    </div>
                </motion.div>

                {/* Proposals List */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
                    </div>
                ) : filteredProposals.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-center py-16 rounded-2xl bg-white/[0.02] border border-white/[0.06]"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-6 h-6 text-zinc-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">
                            {searchQuery ? 'No proposals found' : filter === 'all' ? 'No proposals yet' : `No ${filter} proposals`}
                        </h3>
                        <p className="text-sm text-zinc-500 mb-6 max-w-sm mx-auto">
                            {searchQuery
                                ? 'Try a different search term'
                                : filter === 'all'
                                ? 'Browse available jobs and start submitting proposals'
                                : `You don't have any ${filter} proposals at the moment`}
                        </p>
                        {filter === 'all' && !searchQuery && (
                            <Link to="/jobs">
                                <Button className="h-10 px-5 rounded-xl bg-white text-black hover:bg-zinc-100 font-semibold">
                                    Browse Jobs
                                </Button>
                            </Link>
                        )}
                    </motion.div>
                ) : (
                    <div className="space-y-3">
                        {filteredProposals.map((proposal, i) => {
                            const statusConfig = STATUS_CONFIG[proposal.status] || STATUS_CONFIG.pending
                            const isActive = ['accepted', 'hired'].includes(proposal.status)
                            const canWithdraw = ['pending', 'submitted'].includes(proposal.status)

                            return (
                                <motion.div
                                    key={proposal.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 + i * 0.03 }}
                                    className="group rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all"
                                >
                                    <div className="p-5">
                                        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                            {/* Job Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className={cn(
                                                        "px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider",
                                                        statusConfig.bg,
                                                        statusConfig.color
                                                    )}>
                                                        {statusConfig.label}
                                                    </span>
                                                </div>
                                                <h3 className="font-semibold text-white truncate group-hover:text-purple-400 transition-colors mb-2">
                                                    {proposal.jobTitle}
                                                </h3>
                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-zinc-500">
                                                    <span className="flex items-center gap-1.5">
                                                        <User className="w-3.5 h-3.5" />
                                                        {proposal.client}
                                                    </span>
                                                    <span className="text-indigo-400 font-medium">◎ {proposal.bid}</span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {proposal.sent}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2 pt-4 lg:pt-0 border-t lg:border-0 border-white/[0.06]">
                                                {canWithdraw && (
                                                    <Button
                                                        variant="ghost"
                                                        onClick={() => handleWithdraw(proposal.id)}
                                                        className="h-9 px-3 rounded-lg text-red-400/70 hover:text-red-400 hover:bg-red-500/10 text-sm"
                                                    >
                                                        <X className="w-4 h-4 mr-1" />
                                                        Withdraw
                                                    </Button>
                                                )}
                                                {isActive && (
                                                    <>
                                                        <Link to="/freelancer/contracts">
                                                            <Button className="h-9 px-4 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 text-sm">
                                                                <FileText className="w-4 h-4 mr-2" />
                                                                Contract
                                                            </Button>
                                                        </Link>
                                                        <Link to="/messages">
                                                            <Button
                                                                variant="outline"
                                                                className="h-9 px-4 rounded-lg border-white/10 text-zinc-300 hover:text-white hover:bg-white/5 text-sm"
                                                            >
                                                                <MessageSquare className="w-4 h-4 mr-2" />
                                                                Message
                                                            </Button>
                                                        </Link>
                                                    </>
                                                )}
                                                <Link to={`/jobs/${proposal.jobId || proposal.id}`}>
                                                    <Button
                                                        variant="outline"
                                                        className="h-9 px-4 rounded-lg border-white/10 text-zinc-300 hover:text-white hover:bg-white/5 text-sm group/btn"
                                                    >
                                                        <Eye className="w-4 h-4 mr-2" />
                                                        View Job
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}
