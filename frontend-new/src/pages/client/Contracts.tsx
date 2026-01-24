import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/button"
import {
    Search, Shield, ChevronRight, Loader2, FileText
} from "lucide-react"
import { ContractAPI, type Contract } from "@/lib/api"
import { cn } from "@/lib/utils"

export function Contracts() {
    const [contracts, setContracts] = useState<Contract[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all')
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

    const filteredContracts = contracts.filter(contract => {
        if (filter !== 'all' && contract.status !== filter) return false
        if (searchQuery && !contract.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
        return true
    })

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            case 'completed': return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
            case 'cancelled': return 'bg-red-500/10 text-red-400 border-red-500/20'
            case 'disputed': return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
            default: return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
        }
    }

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
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-4xl font-heading font-bold text-white mb-2 tracking-tight">My Contracts</h1>
                    <p className="text-zinc-400 text-lg">Manage your active contracts and milestones.</p>
                </div>
            </div>

            {/* Controls Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
                {/* Filters */}
                <div className="flex items-center gap-1 bg-[#0a0a0c] p-1.5 rounded-xl border border-white/5 w-full md:w-fit overflow-x-auto">
                    {(['all', 'active', 'completed', 'cancelled'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={cn(
                                "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 capitalize whitespace-nowrap",
                                filter === f ? "bg-white/10 text-white shadow-sm" : "text-zinc-500 hover:text-white hover:bg-white/5"
                            )}
                        >
                            {f}
                            {f !== 'all' && (
                                <span className="ml-1.5 opacity-60 text-xs text-zinc-400">
                                    ({contracts.filter(c => c.status === f).length})
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                        type="text"
                        placeholder="Search contracts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-11 bg-[#0a0a0c] border border-white/10 rounded-xl pl-10 pr-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
                    />
                </div>
            </div>

            {/* Contracts List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                    </div>
                ) : filteredContracts.length === 0 ? (
                    <div className="text-center py-24 bg-[#0a0a0c] border border-white/5 rounded-3xl flex flex-col items-center justify-center">
                        <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-6">
                            <FileText className="w-10 h-10 text-zinc-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">No contracts found</h3>
                        <p className="text-zinc-500 mb-8 max-w-sm">
                            {filter === 'all'
                                ? "You don't have any contracts yet. Hire a freelancer to create your first contract."
                                : `You don't have any ${filter} contracts.`}
                        </p>
                        {filter === 'all' && (
                            <Link to="/client/jobs">
                                <Button className="h-11 px-8 rounded-xl bg-white text-black hover:bg-zinc-200 font-bold transition-all hover:scale-105">
                                    View Your Jobs
                                </Button>
                            </Link>
                        )}
                    </div>
                ) : (
                    filteredContracts.map((contract) => {
                        const progress = getProgress(contract)
                        const pendingApprovals = getPendingApprovals(contract)

                        return (
                            <Link
                                key={contract.id}
                                to={`/client/contracts/${contract.id}`}
                                className="group block bg-[#0a0a0c] border border-white/5 rounded-2xl p-6 transition-all duration-300 hover:border-indigo-500/30 hover:shadow-[0_0_30px_rgba(99,102,241,0.05)] hover:-translate-y-1"
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors tracking-tight">
                                                {contract.title}
                                            </h3>
                                            <span className={cn(
                                                "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                                                getStatusColor(contract.status)
                                            )}>
                                                {contract.status}
                                            </span>
                                            {pendingApprovals > 0 && (
                                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse">
                                                    {pendingApprovals} pending
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 text-sm">
                                            <span className="text-zinc-400 font-medium">
                                                with <span className="text-white">{contract.freelancer?.display_name || 'Freelancer'}</span>
                                            </span>
                                            <span className="text-zinc-600">•</span>
                                            <span className="text-zinc-500">
                                                {contract.milestones?.length || 0} milestones
                                            </span>
                                        </div>

                                        {/* Progress Bar */}
                                        {contract.status === 'active' && (
                                            <div className="mt-4">
                                                <div className="flex items-center justify-between text-xs mb-1">
                                                    <span className="text-zinc-500">Progress</span>
                                                    <span className="text-white font-medium">{progress}%</span>
                                                </div>
                                                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                                                        style={{ width: `${progress}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="flex flex-col items-center px-6 border-r border-white/5 min-w-[100px]">
                                            <div className="flex items-center gap-1 text-emerald-400 mb-1">
                                                <Shield className="w-4 h-4" />
                                                <span className="text-xl font-heading font-bold">◎ {contract.total_amount}</span>
                                            </div>
                                            <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Total Value</div>
                                        </div>

                                        <ChevronRight className="w-5 h-5 text-zinc-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                                    </div>
                                </div>
                            </Link>
                        )
                    })
                )}
            </div>
        </DashboardLayout>
    )
}
