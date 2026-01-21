import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Eye, Loader2, ArrowUpRight, Search } from "lucide-react"
import { ProposalAPI, type Proposal } from "@/lib/api"
import { cn } from "@/lib/utils"

// Mock Data for fallback
const MOCK_PROPOSALS = [
    {
        id: "1",
        jobTitle: "Senior Rust Developer for Solana DeFi Protocol",
        client: "DeFi Kingdoms",
        sent: "2 days ago",
        status: "pending",
        bid: 450
    },
    {
        id: "2",
        jobTitle: "Frontend React Engineer (Web3 Integration)",
        client: "Magic Eden",
        sent: "5 days ago",
        status: "shortlisted",
        bid: 25
    },
    {
        id: "3",
        jobTitle: "Smart Contract Auditor for NFT Marketplace",
        client: "Tensor",
        sent: "1 week ago",
        status: "hired",
        bid: 150
    },
    {
        id: "4",
        jobTitle: "Community Manager for DAO",
        client: "Superteam",
        sent: "2 weeks ago",
        status: "rejected",
        bid: 10
    }
]

const STATUS_LABELS: Record<string, { label: string; color: string; border: string }> = {
    pending: { label: "Submitted", color: "bg-amber-500/10 text-amber-500", border: "border-amber-500/20" },
    shortlisted: { label: "Shortlisted", color: "bg-purple-500/10 text-purple-400", border: "border-purple-500/20" },
    hired: { label: "Hired", color: "bg-emerald-500/10 text-emerald-400", border: "border-emerald-500/20" },
    rejected: { label: "Rejected", color: "bg-red-500/10 text-red-400", border: "border-red-500/20" },
    withdrawn: { label: "Withdrawn", color: "bg-zinc-500/10 text-zinc-400", border: "border-zinc-500/20" },
}

export function MyProposals() {
    const [proposals, setProposals] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<'all' | 'active' | 'archived'>('all')

    useEffect(() => {
        const loadProposals = async () => {
            setLoading(true)
            try {
                const data = await ProposalAPI.getMyProposals()
                const mapped = (data.proposals || []).map((p: Proposal) => ({
                    id: p.id,
                    jobTitle: p.job?.title || "Unknown Job",
                    client: p.job?.client?.display_name || "Unknown Client",
                    sent: new Date(p.created_at).toLocaleDateString(),
                    status: p.status,
                    bid: p.proposed_rate,
                    jobId: p.job_id
                }))
                setProposals(mapped.length > 0 ? mapped : MOCK_PROPOSALS)
            } catch (error) {
                console.error("Failed to load proposals:", error)
                setProposals(MOCK_PROPOSALS)
            } finally {
                setLoading(false)
            }
        }
        loadProposals()
    }, [])

    const filteredProposals = proposals.filter(p => {
        if (filter === 'active') return !['rejected', 'withdrawn'].includes(p.status)
        if (filter === 'archived') return ['rejected', 'withdrawn'].includes(p.status)
        return true
    })

    const activeCount = proposals.filter(p => !['rejected', 'withdrawn'].includes(p.status)).length
    const archivedCount = proposals.filter(p => ['rejected', 'withdrawn'].includes(p.status)).length

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
            <div className="mb-10 animate-fade-in-up">
                <h1 className="text-4xl font-heading font-semibold text-white mb-2 tracking-tight">My Proposals</h1>
                <p className="text-zinc-400 text-lg">Track and manage your applications.</p>
            </div>

            {/* Controls Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
                {/* Filters */}
                <div className="flex items-center gap-1 bg-[#0a0a0c] p-1.5 rounded-xl border border-white/5 w-full md:w-fit">
                    <button
                        onClick={() => setFilter('all')}
                        className={cn(
                            "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                            filter === 'all' ? "bg-white/10 text-white shadow-sm" : "text-zinc-500 hover:text-white hover:bg-white/5"
                        )}
                    >
                        All Proposals
                    </button>
                    <button
                        onClick={() => setFilter('active')}
                        className={cn(
                            "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                            filter === 'active' ? "bg-white/10 text-white shadow-sm" : "text-zinc-500 hover:text-white hover:bg-white/5"
                        )}
                    >
                        Active <span className="ml-1.5 opacity-60 text-xs">({activeCount})</span>
                    </button>
                    <button
                        onClick={() => setFilter('archived')}
                        className={cn(
                            "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                            filter === 'archived' ? "bg-white/10 text-white shadow-sm" : "text-zinc-500 hover:text-white hover:bg-white/5"
                        )}
                    >
                        Archived <span className="ml-1.5 opacity-60 text-xs">({archivedCount})</span>
                    </button>
                </div>

                {/* Search (Visual Only for now) */}
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                        type="text"
                        placeholder="Search proposals..."
                        className="w-full h-10 bg-[#0a0a0c] border border-white/10 rounded-xl pl-9 pr-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
                    />
                </div>
            </div>

            {/* Proposals List */}
            {loading ? (
                <div className="flex items-center justify-center py-32">
                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                </div>
            ) : filteredProposals.length === 0 ? (
                <div className="text-center py-24 bg-[#0a0a0c] border border-white/5 rounded-3xl">
                    <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-8 h-8 text-zinc-600" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No proposals found</h3>
                    <p className="text-zinc-500 mb-6 max-w-sm mx-auto">You haven't submitted any proposals matching this filter yet.</p>
                    <Link to="/jobs">
                        <Button className="h-11 px-8 rounded-xl bg-white text-black hover:bg-zinc-200 font-bold transition-all hover:scale-105">
                            Browse New Jobs
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredProposals.map((proposal, i) => {
                        const statusInfo = STATUS_LABELS[proposal.status] || STATUS_LABELS.pending
                        return (
                            <div
                                key={proposal.id}
                                className="group bg-[#0a0a0c] border border-white/5 rounded-2xl p-6 transition-all duration-300 hover:border-indigo-500/30 hover:shadow-[0_0_30px_rgba(99,102,241,0.05)] hover:-translate-y-0.5"
                                style={{ animationDelay: `${i * 0.05}s` }}
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors tracking-tight">
                                                {proposal.jobTitle}
                                            </h3>
                                            <span className={cn(
                                                "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                                                statusInfo.color,
                                                statusInfo.border
                                            )}>
                                                {statusInfo.label}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm">
                                            <span className="text-zinc-400">Client: <span className="text-zinc-200 font-medium">{proposal.client}</span></span>
                                            <span className="text-zinc-700 mx-1">•</span>
                                            <span className="text-zinc-400">Bid: <span className="text-white font-bold">◎ {proposal.bid}</span></span>
                                            <span className="text-zinc-700 mx-1">•</span>
                                            <span className="text-zinc-500">Sent {proposal.sent}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 pt-4 md:pt-0 border-t md:border-0 border-white/5">
                                        {proposal.status === 'pending' && (
                                            <Button
                                                variant="ghost"
                                                onClick={() => handleWithdraw(proposal.id)}
                                                className="border border-red-500/10 text-red-500/70 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 h-10 px-4 rounded-xl"
                                            >
                                                Withdraw
                                            </Button>
                                        )}
                                        <Link to={`/jobs/${proposal.jobId || proposal.id}`}>
                                            <Button variant="outline" className="border-white/10 text-zinc-300 hover:text-white hover:bg-white/5 h-10 px-4 rounded-xl group/btn">
                                                View Job
                                                <ArrowUpRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </DashboardLayout>
    )
}
