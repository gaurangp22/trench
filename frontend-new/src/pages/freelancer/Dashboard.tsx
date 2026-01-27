import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import {
    DollarSign, Briefcase, FileText,
    Star, Shield, ArrowUpRight, MessageSquare,
    Loader2, CheckCircle2, ArrowRight, Eye, Wallet
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/AuthContext"
import { ContractAPI, ProposalAPI, ProfileAPI, type Contract, type Proposal } from "@/lib/api"
import { StatCard, EmptyState } from "@/components/shared"

export function FreelancerDashboard() {
    const navigate = useNavigate()
    const { profile } = useAuth()
    const [isLoading, setIsLoading] = useState(true)
    const [contracts, setContracts] = useState<Contract[]>([])
    const [proposals, setProposals] = useState<Proposal[]>([])
    const [stats, setStats] = useState<{ total_earnings?: number; jobs_completed?: number; rating?: number; review_count?: number }>({})

    useEffect(() => {
        loadDashboardData()
    }, [])

    const loadDashboardData = async () => {
        try {
            const [contractsData, proposalsData, profileData] = await Promise.all([
                ContractAPI.list({ role: 'freelancer' }),
                ProposalAPI.getMyProposals(),
                ProfileAPI.getMyProfile()
            ])
            setContracts(Array.isArray(contractsData?.contracts) ? contractsData.contracts : [])
            setProposals(Array.isArray(proposalsData?.proposals) ? proposalsData.proposals : [])
            const p = profileData?.profile as any
            setStats({
                total_earnings: parseFloat(p?.total_earnings_sol) || 0,
                jobs_completed: parseInt(p?.total_jobs_completed) || 0,
                rating: parseFloat(p?.average_rating) || 0,
                review_count: parseInt(p?.total_reviews) || 0
            })
        } catch (error) {
            console.error("Failed to load dashboard data:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const activeContracts = contracts.filter(c => c.status === 'active')
    const escrowBalance = activeContracts.reduce((sum, c) => sum + (c.total_amount || 0), 0)
    const pendingProposals = proposals.filter(p => p.status === 'pending' || p.status === 'shortlisted')

    if (isLoading) {
        return (
            <DashboardLayout role="freelancer">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout role="freelancer">
            <div className="space-y-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
                >
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-1">
                            Welcome back{profile?.display_name ? `, ${profile.display_name}` : ''}
                        </h1>
                        <div className="flex items-center gap-3 text-zinc-400">
                            {(stats.rating ?? 0) > 0 && (
                                <span className="flex items-center gap-1.5">
                                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                    <span className="text-white font-medium">{stats.rating?.toFixed(1)}</span>
                                    <span className="text-zinc-500">({stats.review_count} reviews)</span>
                                </span>
                            )}
                            <span>{stats.jobs_completed || 0} jobs completed</span>
                        </div>
                    </div>
                    <Link to="/jobs">
                        <Button className="h-11 px-5 rounded-xl bg-white text-black hover:bg-zinc-100 font-semibold group">
                            Browse Jobs
                            <ArrowUpRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </Button>
                    </Link>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        delay={0.05}
                        icon={DollarSign}
                        label="Total Earnings"
                        value={`${stats.total_earnings?.toFixed(1) || 0} SOL`}
                        color="emerald"
                    />
                    <StatCard
                        delay={0.1}
                        icon={Shield}
                        label="In Escrow"
                        value={`${escrowBalance.toFixed(1)} SOL`}
                        color="blue"
                    />
                    <StatCard
                        delay={0.15}
                        icon={Briefcase}
                        label="Active Jobs"
                        value={activeContracts.length.toString()}
                        color="purple"
                    />
                    <StatCard
                        delay={0.2}
                        icon={FileText}
                        label="Pending Proposals"
                        value={pendingProposals.length.toString()}
                        color="amber"
                        highlight={pendingProposals.length > 0}
                    />
                </div>

                {/* Main Content Grid */}
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Active Contracts */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                        className="lg:col-span-2 rounded-2xl bg-white/[0.02] border border-white/[0.06] overflow-hidden"
                    >
                        <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-purple-400" />
                                Active Contracts
                            </h2>
                            <Link to="/freelancer/contracts" className="text-sm text-zinc-500 hover:text-white transition-colors">
                                View all
                            </Link>
                        </div>

                        {activeContracts.length === 0 ? (
                            <EmptyState
                                icon={Briefcase}
                                title="No active contracts"
                                description="Start by browsing available jobs and submitting proposals"
                                actionLabel="Browse Jobs"
                                actionHref="/jobs"
                            />
                        ) : (
                            <div className="divide-y divide-white/[0.06]">
                                {activeContracts.slice(0, 4).map((contract) => {
                                    const completedMilestones = contract.milestones?.filter(m => m.status === 'approved').length || 0
                                    const totalMilestones = contract.milestones?.length || 1
                                    const progress = Math.round((completedMilestones / totalMilestones) * 100)
                                    const nextMilestone = contract.milestones?.find(m => m.status === 'in_progress' || m.status === 'pending')

                                    return (
                                        <div
                                            key={contract.id}
                                            className="p-5 hover:bg-white/[0.02] transition-colors group cursor-pointer"
                                            onClick={() => navigate(`/freelancer/contracts/${contract.id}`)}
                                        >
                                            <div className="flex items-start justify-between gap-4 mb-4">
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-white truncate group-hover:text-purple-400 transition-colors">
                                                        {contract.title}
                                                    </h3>
                                                    <p className="text-sm text-zinc-500">{contract.client?.display_name}</p>
                                                </div>
                                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                                    <Shield className="w-3.5 h-3.5 text-emerald-400" />
                                                    <span className="text-sm font-semibold text-emerald-400">◎ {contract.total_amount}</span>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="text-zinc-500">Progress</span>
                                                    <span className="text-white font-medium">{progress}%</span>
                                                </div>
                                                <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500"
                                                        style={{ width: `${progress}%` }}
                                                    />
                                                </div>
                                                {nextMilestone && (
                                                    <p className="text-xs text-zinc-500">
                                                        Next: <span className="text-zinc-400">{nextMilestone.title}</span>
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </motion.div>

                    {/* Right Sidebar */}
                    <div className="space-y-6">
                        {/* Pending Proposals */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="rounded-2xl bg-white/[0.02] border border-white/[0.06] overflow-hidden"
                        >
                            <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
                                <h3 className="font-semibold text-white flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-amber-400" />
                                    Proposals
                                </h3>
                                <Link to="/freelancer/proposals" className="text-xs text-zinc-500 hover:text-white transition-colors">
                                    View all
                                </Link>
                            </div>

                            {pendingProposals.length === 0 ? (
                                <div className="p-6 text-center">
                                    <p className="text-sm text-zinc-500">No pending proposals</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-white/[0.06]">
                                    {pendingProposals.slice(0, 4).map((proposal) => (
                                        <div
                                            key={proposal.id}
                                            className="p-4 hover:bg-white/[0.02] transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "w-2 h-2 rounded-full shrink-0",
                                                    proposal.status === 'shortlisted' ? "bg-emerald-400" : "bg-zinc-600"
                                                )} />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-white truncate">
                                                        {proposal.job?.title || 'Job'}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-xs text-zinc-500">◎ {proposal.proposed_rate}</span>
                                                        {proposal.status === 'shortlisted' && (
                                                            <span className="flex items-center gap-1 text-xs text-emerald-400">
                                                                <Eye className="w-3 h-3" />
                                                                Shortlisted
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>

                        {/* Quick Actions */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.35 }}
                            className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-5"
                        >
                            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Quick Actions</h3>
                            <div className="space-y-2">
                                <Link
                                    to="/jobs"
                                    className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all group"
                                >
                                    <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                                        <Briefcase className="w-4 h-4 text-emerald-400" />
                                    </div>
                                    <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">Find Jobs</span>
                                    <ArrowRight className="w-4 h-4 text-zinc-600 ml-auto group-hover:text-zinc-400 group-hover:translate-x-0.5 transition-all" />
                                </Link>

                                <Link
                                    to="/escrow"
                                    className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all group"
                                >
                                    <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                                        <Wallet className="w-4 h-4 text-blue-400" />
                                    </div>
                                    <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">View Escrow</span>
                                    <ArrowRight className="w-4 h-4 text-zinc-600 ml-auto group-hover:text-zinc-400 group-hover:translate-x-0.5 transition-all" />
                                </Link>

                                <Link
                                    to="/messages"
                                    className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all group"
                                >
                                    <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                                        <MessageSquare className="w-4 h-4 text-purple-400" />
                                    </div>
                                    <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">Messages</span>
                                    <ArrowRight className="w-4 h-4 text-zinc-600 ml-auto group-hover:text-zinc-400 group-hover:translate-x-0.5 transition-all" />
                                </Link>
                            </div>
                        </motion.div>

                        {/* Getting Started - only show for new freelancers */}
                        {contracts.length === 0 && proposals.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 p-5"
                            >
                                <h3 className="text-lg font-semibold text-white mb-3">Getting Started</h3>
                                <p className="text-sm text-zinc-400 mb-4">
                                    Complete these steps to start earning on TrenchJobs
                                </p>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                                            <CheckCircle2 className="w-4 h-4 text-white" />
                                        </div>
                                        <span className="text-sm text-zinc-300">Create your account</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-zinc-400">2</div>
                                        <span className="text-sm text-zinc-400">Complete your profile</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-zinc-400">3</div>
                                        <span className="text-sm text-zinc-400">Submit your first proposal</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
