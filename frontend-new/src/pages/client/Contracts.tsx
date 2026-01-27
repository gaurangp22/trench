import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/Button"
import { motion } from "framer-motion"
import {
    Search, ChevronRight, Loader2, FileText, User, CheckCircle
} from "lucide-react"
import { ContractAPI, type Contract } from "@/lib/api"
import { cn } from "@/lib/utils"

type FilterType = 'all' | 'pending' | 'active' | 'completed' | 'cancelled'

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    pending: { label: "Pending", color: "text-amber-400", bg: "bg-amber-500/10" },
    active: { label: "Active", color: "text-blue-400", bg: "bg-blue-500/10" },
    completed: { label: "Completed", color: "text-emerald-400", bg: "bg-emerald-500/10" },
    cancelled: { label: "Cancelled", color: "text-red-400", bg: "bg-red-500/10" },
    disputed: { label: "Disputed", color: "text-purple-400", bg: "bg-purple-500/10" },
}

export function Contracts() {
    const [contracts, setContracts] = useState<Contract[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<FilterType>('all')
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        loadContracts()
    }, [])

    const loadContracts = async () => {
        try {
            setLoading(true)
            const data = await ContractAPI.list({ role: 'client' })
            setContracts(data.contracts || [])
        } catch (error) {
            console.error("Failed to load contracts:", error)
        } finally {
            setLoading(false)
        }
    }

    const filteredContracts = contracts
        .filter(contract => {
            if (filter !== 'all' && contract.status !== filter) return false
            if (searchQuery && !contract.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
            return true
        })

    const getCounts = () => ({
        all: contracts.length,
        pending: contracts.filter(c => c.status === 'pending').length,
        active: contracts.filter(c => c.status === 'active').length,
        completed: contracts.filter(c => c.status === 'completed').length,
        cancelled: contracts.filter(c => c.status === 'cancelled').length,
    })

    const counts = getCounts()

    const getProgress = (contract: Contract) => {
        if (!contract.milestones?.length) return 0
        const approved = contract.milestones.filter(m => m.status === 'approved').length
        return Math.round((approved / contract.milestones.length) * 100)
    }

    const getPendingApprovals = (contract: Contract) => {
        return contract.milestones?.filter(m => m.status === 'submitted').length || 0
    }

    return (
        <DashboardLayout role="client">
            <div className="space-y-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
                >
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-1">My Contracts</h1>
                        <p className="text-zinc-400">Manage your active contracts and milestones</p>
                    </div>
                    <Link to="/client/jobs">
                        <Button className="h-11 px-5 rounded-xl bg-white text-black hover:bg-zinc-100 font-semibold">
                            View Jobs
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
                    <div className="flex items-center gap-1 p-1 bg-white/[0.02] rounded-xl border border-white/[0.06] overflow-x-auto">
                        {(['all', 'pending', 'active', 'completed'] as FilterType[]).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize whitespace-nowrap",
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
                            <FileText className="w-6 h-6 text-zinc-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">
                            {searchQuery ? 'No contracts found' : filter === 'all' ? 'No contracts yet' : `No ${filter} contracts`}
                        </h3>
                        <p className="text-sm text-zinc-500 mb-6 max-w-sm mx-auto">
                            {searchQuery
                                ? 'Try a different search term'
                                : filter === 'all'
                                ? 'Hire a freelancer from your job proposals to create your first contract'
                                : `You don't have any ${filter} contracts at the moment`}
                        </p>
                        {filter === 'all' && !searchQuery && (
                            <Link to="/client/jobs">
                                <Button className="h-10 px-5 rounded-xl bg-white text-black hover:bg-zinc-100 font-semibold">
                                    View Your Jobs
                                </Button>
                            </Link>
                        )}
                    </motion.div>
                ) : (
                    <div className="space-y-3">
                        {filteredContracts.map((contract, i) => {
                            const statusConfig = STATUS_CONFIG[contract.status] || STATUS_CONFIG.pending
                            const progress = getProgress(contract)
                            const pendingApprovals = getPendingApprovals(contract)
                            const completedMilestones = contract.milestones?.filter(m => m.status === 'approved').length || 0
                            const totalMilestones = contract.milestones?.length || 0

                            return (
                                <motion.div
                                    key={contract.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 + i * 0.03 }}
                                >
                                    <Link
                                        to={`/client/contracts/${contract.id}`}
                                        className="group block rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all"
                                    >
                                        <div className="p-5">
                                            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                                {/* Contract Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <span className={cn(
                                                            "px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider",
                                                            statusConfig.bg,
                                                            statusConfig.color
                                                        )}>
                                                            {statusConfig.label}
                                                        </span>
                                                        {pendingApprovals > 0 && (
                                                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-amber-500/10 text-amber-400 animate-pulse">
                                                                {pendingApprovals} pending approval
                                                            </span>
                                                        )}
                                                    </div>
                                                    <h3 className="font-semibold text-white truncate group-hover:text-blue-400 transition-colors mb-2">
                                                        {contract.title}
                                                    </h3>
                                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-zinc-500">
                                                        <span className="flex items-center gap-1.5">
                                                            <User className="w-3.5 h-3.5" />
                                                            {contract.freelancer?.display_name || 'Freelancer'}
                                                        </span>
                                                        <span className="flex items-center gap-1.5">
                                                            <CheckCircle className="w-3.5 h-3.5" />
                                                            {completedMilestones}/{totalMilestones} milestones
                                                        </span>
                                                        <span className="text-emerald-400 font-medium">◎ {contract.total_amount}</span>
                                                    </div>

                                                    {/* Progress Bar */}
                                                    {contract.status === 'active' && (
                                                        <div className="mt-3">
                                                            <div className="flex items-center gap-2">
                                                                <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                                                                    <div
                                                                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                                                                        style={{ width: `${progress}%` }}
                                                                    />
                                                                </div>
                                                                <span className="text-xs text-white font-medium w-8">{progress}%</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Arrow */}
                                                <div className="hidden lg:flex items-center">
                                                    <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            )
                        })}
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}
