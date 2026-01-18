import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Eye, ExternalLink, Loader2 } from "lucide-react"
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

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    pending: { label: "Submitted", color: "bg-green-500/10 text-green-400" },
    shortlisted: { label: "Shortlisted", color: "bg-purple-500/10 text-purple-400" },
    hired: { label: "Hired", color: "bg-blue-500/10 text-blue-400" },
    rejected: { label: "Rejected", color: "bg-zinc-500/10 text-zinc-400" },
    withdrawn: { label: "Withdrawn", color: "bg-zinc-500/10 text-zinc-400" },
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
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white">My Proposals</h1>
                <p className="text-zinc-400 mt-1">Track the status of your job applications.</p>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 mb-6 bg-zinc-900/50 p-2 rounded-xl border border-zinc-800 w-full md:w-fit">
                <Button
                    variant="ghost"
                    onClick={() => setFilter('all')}
                    className={cn("h-8 text-xs", filter === 'all' ? "text-white bg-zinc-800" : "text-zinc-400 hover:text-white")}
                >
                    All Proposals
                </Button>
                <Button
                    variant="ghost"
                    onClick={() => setFilter('active')}
                    className={cn("h-8 text-xs", filter === 'active' ? "text-white bg-zinc-800" : "text-zinc-400 hover:text-white")}
                >
                    Active ({activeCount})
                </Button>
                <Button
                    variant="ghost"
                    onClick={() => setFilter('archived')}
                    className={cn("h-8 text-xs", filter === 'archived' ? "text-white bg-zinc-800" : "text-zinc-400 hover:text-white")}
                >
                    Archived ({archivedCount})
                </Button>
            </div>

            {/* Proposals List */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
                </div>
            ) : filteredProposals.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-zinc-500 mb-4">No proposals found</p>
                    <Link to="/jobs">
                        <Button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                            Browse Jobs
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredProposals.map((proposal) => {
                        const statusInfo = STATUS_LABELS[proposal.status] || STATUS_LABELS.pending
                        return (
                            <div
                                key={proposal.id}
                                className="group bg-zinc-900/30 border border-zinc-800 rounded-xl p-6 transition-all hover:bg-zinc-900/50 hover:border-zinc-700"
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold text-white group-hover:text-purple-400 transition-colors">
                                                {proposal.jobTitle}
                                            </h3>
                                            <span className={cn(
                                                "px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider",
                                                statusInfo.color
                                            )}>
                                                {statusInfo.label}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-zinc-500">
                                            <span>Client: {proposal.client}</span>
                                            <span>•</span>
                                            <span>Bid: ◎ {proposal.bid} SOL</span>
                                            <span>•</span>
                                            <span>Sent {proposal.sent}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {proposal.status === 'pending' && (
                                            <Button
                                                variant="outline"
                                                onClick={() => handleWithdraw(proposal.id)}
                                                className="border-red-500/20 text-red-400 hover:bg-red-500/10 h-9"
                                            >
                                                Withdraw
                                            </Button>
                                        )}
                                        <Link to={`/jobs/${proposal.jobId || proposal.id}`}>
                                            <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 h-9">
                                                <Eye className="w-4 h-4 mr-2" />
                                                View Job
                                            </Button>
                                        </Link>
                                        <Button size="icon" variant="ghost" className="text-zinc-500 hover:text-white h-9 w-9">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </Button>
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
