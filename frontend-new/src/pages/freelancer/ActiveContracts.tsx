import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/Button"
import { motion } from "framer-motion"
import {
    MessageSquare, Loader2, Search, Briefcase, Shield, CheckCircle,
    Clock, ChevronRight, User, ArrowRight
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ContractAPI, MessageAPI, type Contract } from "@/lib/api"

type FilterType = 'all' | 'pending' | 'active' | 'completed'

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    pending: { label: "Pending", color: "text-amber-400", bg: "bg-amber-500/10" },
    active: { label: "Active", color: "text-blue-400", bg: "bg-blue-500/10" },
    completed: { label: "Completed", color: "text-emerald-400", bg: "bg-emerald-500/10" },
    disputed: { label: "Disputed", color: "text-red-400", bg: "bg-red-500/10" },
    cancelled: { label: "Cancelled", color: "text-zinc-400", bg: "bg-zinc-500/10" },
}

export function ActiveContracts() {
    const navigate = useNavigate()
    const [contracts, setContracts] = useState<Contract[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<FilterType>('all')
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        loadContracts()
    }, [])

    const loadContracts = async () => {
        try {
            setLoading(true)
            const data = await ContractAPI.list({ role: 'freelancer' })
            setContracts(data.contracts || [])
        } catch (error) {
            console.error("Failed to load contracts:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleMessage = async (contractId: string) => {
        try {
            const conversation = await MessageAPI.getContractConversation(contractId)
            navigate(`/messages?conversation=${conversation.id}`)
        } catch (error) {
            console.error("Failed to get conversation:", error)
        }
    }

    const filteredContracts = contracts
        .filter(c => {
            if (filter === 'pending') return c.status === 'pending'
            if (filter === 'active') return c.status === 'active'
            if (filter === 'completed') return c.status === 'completed'
            return true
        })
        .filter(c => {
            if (!searchQuery) return true
            return c.title.toLowerCase().includes(searchQuery.toLowerCase())
        })

    const getCounts = () => ({
        all: contracts.length,
        pending: contracts.filter(c => c.status === 'pending').length,
        active: contracts.filter(c => c.status === 'active').length,
        completed: contracts.filter(c => c.status === 'completed').length,
    })

    const counts = getCounts()

    const getProgress = (contract: Contract) => {
        if (!contract.milestones?.length) return 0
        const approved = contract.milestones.filter(m => m.status === 'approved').length
        return Math.round((approved / contract.milestones.length) * 100)
    }

    const getNextMilestone = (contract: Contract) => {
        if (!contract.milestones?.length) return null
        return contract.milestones.find(m => m.status !== 'approved') || null
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
                        <h1 className="text-3xl font-bold text-white mb-1">My Contracts</h1>
                        <p className="text-zinc-400">Manage your active work and track payments</p>
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
                        {(['all', 'pending', 'active', 'completed'] as FilterType[]).map((f) => (
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
                            placeholder="Search contracts..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full sm:w-64 h-10 bg-white/[0.02] border border-white/[0.06] rounded-xl pl-10 pr-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/20 transition-colors"
                        />
                    </div>
                </motion.div>

                {/* Contracts List */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
                    </div>
                ) : filteredContracts.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-center py-16 rounded-2xl bg-white/[0.02] border border-white/[0.06]"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
                            <Briefcase className="w-6 h-6 text-zinc-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">
                            {searchQuery ? 'No contracts found' : filter === 'all' ? 'No contracts yet' : `No ${filter} contracts`}
                        </h3>
                        <p className="text-sm text-zinc-500 mb-6 max-w-sm mx-auto">
                            {searchQuery
                                ? 'Try a different search term'
                                : filter === 'all'
                                ? 'Start by browsing jobs and submitting proposals'
                                : `You don't have any ${filter} contracts at the moment`}
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
                    <div className="space-y-4">
                        {filteredContracts.map((contract, i) => {
                            const statusConfig = STATUS_CONFIG[contract.status] || STATUS_CONFIG.pending
                            const progress = getProgress(contract)
                            const nextMilestone = getNextMilestone(contract)
                            const completedMilestones = contract.milestones?.filter(m => m.status === 'approved').length || 0
                            const totalMilestones = contract.milestones?.length || 0

                            return (
                                <motion.div
                                    key={contract.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 + i * 0.05 }}
                                    className="group rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all overflow-hidden"
                                >
                                    <div className="p-6">
                                        {/* Header Row */}
                                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-5">
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
                                                <h3 className="text-xl font-semibold text-white truncate group-hover:text-purple-400 transition-colors mb-2">
                                                    {contract.title}
                                                </h3>
                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-zinc-500">
                                                    <span className="flex items-center gap-1.5">
                                                        <User className="w-3.5 h-3.5" />
                                                        {contract.client?.display_name || 'Client'}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        Started {new Date(contract.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => handleMessage(contract.id)}
                                                    className="h-9 px-4 rounded-lg border border-white/[0.06] text-zinc-400 hover:text-white hover:bg-white/5 text-sm"
                                                >
                                                    <MessageSquare className="w-4 h-4 mr-2" />
                                                    Message
                                                </Button>
                                                <Button
                                                    onClick={() => navigate(`/freelancer/contracts/${contract.id}`)}
                                                    className="h-9 px-4 rounded-lg bg-white text-black hover:bg-zinc-100 font-semibold text-sm"
                                                >
                                                    View Details
                                                    <ChevronRight className="w-4 h-4 ml-1" />
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Stats Grid */}
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-white/[0.02] rounded-xl border border-white/[0.04]">
                                            <div>
                                                <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Total Value</div>
                                                <div className="text-lg font-semibold text-emerald-400">◎ {contract.total_amount}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Progress</div>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                                                            style={{ width: `${progress}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-sm font-medium text-white">{progress}%</span>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Milestones</div>
                                                <div className="flex items-center gap-1.5 text-white">
                                                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                                                    <span className="font-semibold">{completedMilestones}</span>
                                                    <span className="text-zinc-500">/ {totalMilestones}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Payment</div>
                                                <div className="flex items-center gap-1.5 text-emerald-400">
                                                    <Shield className="w-4 h-4" />
                                                    <span className="font-medium">Escrow Protected</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Next Milestone */}
                                        {nextMilestone && contract.status === 'active' && (
                                            <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <ArrowRight className="w-4 h-4 text-zinc-500" />
                                                    <span className="text-zinc-400">Next:</span>
                                                    <span className="text-white font-medium">{nextMilestone.title}</span>
                                                    <span className={cn(
                                                        "px-2 py-0.5 rounded text-xs",
                                                        nextMilestone.status === 'submitted' ? "bg-amber-500/10 text-amber-400" :
                                                        nextMilestone.status === 'in_progress' ? "bg-blue-500/10 text-blue-400" :
                                                        "bg-zinc-500/10 text-zinc-400"
                                                    )}>
                                                        {nextMilestone.status.replace('_', ' ')}
                                                    </span>
                                                </div>
                                                {nextMilestone.status === 'in_progress' && (
                                                    <Button
                                                        onClick={() => navigate(`/freelancer/contracts/${contract.id}`)}
                                                        className="h-8 px-4 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 text-sm"
                                                    >
                                                        Submit Work
                                                    </Button>
                                                )}
                                            </div>
                                        )}
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
