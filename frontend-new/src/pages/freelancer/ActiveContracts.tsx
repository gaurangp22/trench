import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/Button"
import { MessageSquare, Loader2, Search, Briefcase, Shield, CheckCircle, Clock, ChevronRight } from "lucide-react"
import { BorderBeam } from "@/components/ui/BorderBeam"
import { cn } from "@/lib/utils"
import { ContractAPI, MessageAPI, type Contract } from "@/lib/api"

export function ActiveContracts() {
    const navigate = useNavigate()
    const [contracts, setContracts] = useState<Contract[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')

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

    const filteredContracts = contracts.filter(c => {
        if (filter === 'active') return c.status === 'active'
        if (filter === 'completed') return c.status === 'completed'
        return true
    })

    const getProgress = (contract: Contract) => {
        if (!contract.milestones?.length) return 0
        const approved = contract.milestones.filter(m => m.status === 'approved').length
        return Math.round((approved / contract.milestones.length) * 100)
    }

    const getNextMilestone = (contract: Contract) => {
        if (!contract.milestones?.length) return null
        return contract.milestones.find(m => m.status !== 'approved') || contract.milestones[contract.milestones.length - 1]
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20', beam: '#818cf8' }
            case 'completed': return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', beam: '#34d399' }
            case 'disputed': return { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', beam: '#f87171' }
            default: return { bg: 'bg-zinc-500/10', text: 'text-zinc-400', border: 'border-zinc-500/20', beam: '#71717a' }
        }
    }

    return (
        <DashboardLayout role="freelancer">
            <div className="mb-10 animate-fade-in-up">
                <h1 className="text-4xl font-heading font-semibold text-white mb-2 tracking-tight">Active Contracts</h1>
                <p className="text-zinc-400 text-lg">Manage your current work and track payments.</p>
            </div>

            {/* Controls Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
                {/* Filters */}
                <div className="flex items-center gap-1 bg-[#0a0a0c] p-1.5 rounded-xl border border-white/5 w-full md:w-fit">
                    {(['all', 'active', 'completed'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={cn(
                                "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 capitalize",
                                filter === f ? "bg-white/10 text-white shadow-sm" : "text-zinc-500 hover:text-white hover:bg-white/5"
                            )}
                        >
                            {f} {f !== 'all' && <span className="ml-1.5 opacity-60 text-xs">({contracts.filter(c => f === 'active' ? c.status === 'active' : c.status === 'completed').length})</span>}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                        type="text"
                        placeholder="Search contracts..."
                        className="w-full h-11 bg-[#0a0a0c] border border-white/10 rounded-xl pl-10 pr-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
                    />
                </div>
            </div>

            {/* Contracts List */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                </div>
            ) : filteredContracts.length === 0 ? (
                <div className="text-center py-24 bg-[#0a0a0c] border border-white/5 rounded-3xl">
                    <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Briefcase className="w-10 h-10 text-zinc-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">No contracts found</h3>
                    <p className="text-zinc-500 mb-8 max-w-sm mx-auto">
                        {filter === 'all'
                            ? "You don't have any contracts yet. Apply to jobs to get started!"
                            : `You don't have any ${filter} contracts.`}
                    </p>
                    {filter === 'all' && (
                        <Link to="/jobs">
                            <Button className="h-11 px-8 rounded-xl bg-white text-black hover:bg-zinc-200 font-bold">
                                Browse Jobs
                            </Button>
                        </Link>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {filteredContracts.map((contract) => {
                        const statusStyle = getStatusColor(contract.status)
                        const progress = getProgress(contract)
                        const nextMilestone = getNextMilestone(contract)

                        return (
                            <div
                                key={contract.id}
                                className="group relative bg-[#0a0a0c] border border-white/5 rounded-3xl overflow-hidden hover:border-white/10 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1"
                            >
                                {/* Electric Border Beam for Active Contracts */}
                                {contract.status === 'active' && (
                                    <BorderBeam
                                        duration={12}
                                        size={400}
                                        color={statusStyle.beam}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                    />
                                )}

                                <div className="relative z-10 p-8">
                                    <div className="flex flex-col md:flex-row justify-between gap-6 mb-6">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                <h3 className="text-2xl font-bold text-white font-heading tracking-tight group-hover:text-indigo-400 transition-colors">
                                                    {contract.title}
                                                </h3>
                                                <span className={cn(
                                                    "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border",
                                                    statusStyle.bg, statusStyle.text, statusStyle.border
                                                )}>
                                                    {contract.status}
                                                </span>
                                            </div>
                                            <p className="text-zinc-400 text-base">
                                                Client: <span className="text-white font-medium">{contract.client?.display_name || 'Client'}</span>
                                                <span className="mx-2">•</span>
                                                Started {new Date(contract.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="flex gap-3">
                                            <Button
                                                variant="ghost"
                                                onClick={() => handleMessage(contract.id)}
                                                className="h-12 px-6 rounded-xl border border-white/5 text-zinc-400 hover:text-white hover:bg-white/5 font-medium transition-all"
                                            >
                                                <MessageSquare className="w-5 h-5 mr-2" />
                                                Message
                                            </Button>
                                            <Button
                                                onClick={() => navigate(`/freelancer/contracts/${contract.id}`)}
                                                className="h-12 px-6 rounded-xl bg-white text-black hover:bg-zinc-200 font-bold transition-all hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                                            >
                                                View Details
                                                <ChevronRight className="w-4 h-4 ml-2" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Progress & Stats */}
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6 bg-black/20 backdrop-blur-md rounded-2xl border border-white/5">
                                        {/* Total Value */}
                                        <div>
                                            <div className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-2">Total Value</div>
                                            <div className="text-xl text-white font-semibold flex items-center gap-2">
                                                ◎ {contract.total_amount}
                                            </div>
                                        </div>

                                        {/* Progress */}
                                        <div>
                                            <div className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-2">Progress</div>
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
                                                        style={{ width: `${progress}%` }}
                                                    />
                                                </div>
                                                <span className="text-white font-semibold">{progress}%</span>
                                            </div>
                                        </div>

                                        {/* Milestones */}
                                        <div>
                                            <div className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-2">Milestones</div>
                                            <div className="text-xl text-white font-semibold flex items-center gap-2">
                                                <CheckCircle className="w-5 h-5 text-emerald-400" />
                                                {contract.milestones?.filter(m => m.status === 'approved').length || 0} / {contract.milestones?.length || 0}
                                            </div>
                                        </div>

                                        {/* Escrow */}
                                        <div>
                                            <div className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-2">Escrow</div>
                                            <div className="text-emerald-400 font-semibold flex items-center gap-2">
                                                <Shield className="w-5 h-5" />
                                                Protected
                                            </div>
                                        </div>
                                    </div>

                                    {/* Next Milestone */}
                                    {nextMilestone && contract.status === 'active' && (
                                        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Clock className="w-4 h-4 text-zinc-500" />
                                                <span className="text-zinc-400">Next milestone:</span>
                                                <span className="text-white font-medium">{nextMilestone.title}</span>
                                                <span className={cn(
                                                    "px-2 py-0.5 rounded text-xs font-medium",
                                                    nextMilestone.status === 'submitted' ? "bg-amber-500/10 text-amber-400" :
                                                    nextMilestone.status === 'in_progress' ? "bg-blue-500/10 text-blue-400" :
                                                    "bg-zinc-500/10 text-zinc-400"
                                                )}>
                                                    {nextMilestone.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                            {nextMilestone.status === 'in_progress' && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => navigate(`/freelancer/contracts/${contract.id}`)}
                                                    className="bg-indigo-500 hover:bg-indigo-600 text-white"
                                                >
                                                    Submit Work
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </DashboardLayout>
    )
}
