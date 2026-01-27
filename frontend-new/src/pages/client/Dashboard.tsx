import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import {
    Briefcase, Users, CheckCircle2, Shield, MessageSquare,
    Plus, AlertCircle, ArrowRight, Sparkles,
    Clock, Zap
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/AuthContext"
import { JobAPI, ContractAPI, type Job, type Contract } from "@/lib/api"
import { StatCard, DashboardSkeleton } from "@/components/shared"

export function ClientDashboard() {
    const navigate = useNavigate()
    const { user, profile } = useAuth()
    const [isLoading, setIsLoading] = useState(true)
    const [jobs, setJobs] = useState<Job[]>([])
    const [contracts, setContracts] = useState<Contract[]>([])

    useEffect(() => {
        loadDashboardData()
    }, [])

    const loadDashboardData = async () => {
        try {
            const [jobsData, contractsData] = await Promise.all([
                JobAPI.getMyJobs(),
                ContractAPI.list({ role: 'client' })
            ])
            setJobs(jobsData)
            setContracts(contractsData?.contracts || [])
        } catch (error) {
            console.error("Failed to load dashboard data:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const activeJobs = jobs.filter(j => j.status === 'open' || j.status === 'in_progress')
    const activeContracts = contracts.filter(c => c.status === 'active')
    const totalProposals = jobs.reduce((sum, job) => sum + (job.proposal_count || 0), 0)
    const escrowBalance = activeContracts.reduce((sum, c) => sum + (c.total_amount || 0), 0)
    const pendingApprovals = activeContracts
        .flatMap(c => (c.milestones || []).filter(m => m.status === 'submitted'))
        .slice(0, 3)

    if (isLoading) {
        return (
            <DashboardLayout role="client">
                <DashboardSkeleton />
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout role="client">
            <div className="space-y-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row sm:items-end justify-between gap-6"
                >
                    <div>
                        <p className="text-sm font-medium text-zinc-500 mb-1">Welcome back</p>
                        <h1 className="text-4xl font-bold text-white tracking-tight">
                            {profile?.display_name || user?.username || 'Dashboard'}
                        </h1>
                    </div>
                    <Link to="/client/post-job">
                        <Button className="h-12 px-6 rounded-xl bg-white text-black hover:bg-zinc-100 font-semibold transition-all group">
                            <Plus className="w-4 h-4 mr-2" />
                            Post New Job
                            <ArrowRight className="w-4 h-4 ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                        </Button>
                    </Link>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        delay={0}
                        icon={Shield}
                        label="In Escrow"
                        value={`${escrowBalance.toFixed(1)} SOL`}
                        trend="Secured funds"
                        color="emerald"
                    />
                    <StatCard
                        delay={0.05}
                        icon={Briefcase}
                        label="Active Jobs"
                        value={activeJobs.length.toString()}
                        trend={`${jobs.filter(j => j.status === 'open').length} open`}
                        color="blue"
                    />
                    <StatCard
                        delay={0.1}
                        icon={Users}
                        label="Proposals"
                        value={totalProposals.toString()}
                        trend="Awaiting review"
                        color="amber"
                        highlight={totalProposals > 0}
                    />
                    <StatCard
                        delay={0.15}
                        icon={CheckCircle2}
                        label="Contracts"
                        value={activeContracts.length.toString()}
                        trend={`${pendingApprovals.length} pending`}
                        color="purple"
                    />
                </div>

                {/* Action Alert */}
                {pendingApprovals.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 p-5"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                        <div className="relative flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                                <AlertCircle className="w-5 h-5 text-amber-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-semibold text-white mb-1">
                                    {pendingApprovals.length} milestone{pendingApprovals.length > 1 ? 's' : ''} awaiting approval
                                </h3>
                                <p className="text-sm text-zinc-400 mb-4">
                                    Review submitted work and release payment to freelancers
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {pendingApprovals.map((milestone) => (
                                        <button
                                            key={milestone.id}
                                            onClick={() => navigate(`/client/contracts/${milestone.contract_id}`)}
                                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-500/30 text-sm text-white transition-all"
                                        >
                                            <span className="truncate max-w-[200px]">{milestone.title}</span>
                                            <span className="text-emerald-400 font-medium">◎{milestone.amount}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Main Content */}
                <div className="grid lg:grid-cols-5 gap-6">
                    {/* Jobs List */}
                    <div className="lg:col-span-3 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-white">Your Jobs</h2>
                            <Link to="/client/jobs" className="text-sm text-zinc-400 hover:text-white transition-colors flex items-center gap-1">
                                View all <ArrowRight className="w-3 h-3" />
                            </Link>
                        </div>

                        {activeJobs.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.25 }}
                                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/[0.06] p-8 text-center"
                            >
                                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.1),transparent_70%)]" />
                                <div className="relative">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-4 border border-white/10">
                                        <Sparkles className="w-7 h-7 text-indigo-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-white mb-2">Ready to hire talent?</h3>
                                    <p className="text-sm text-zinc-400 mb-6 max-w-sm mx-auto">
                                        Post your first job and connect with skilled web3 professionals
                                    </p>
                                    <Link to="/client/post-job">
                                        <Button className="h-11 px-6 rounded-xl bg-white text-black hover:bg-zinc-100 font-semibold">
                                            Create Your First Job
                                        </Button>
                                    </Link>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="space-y-3">
                                {activeJobs.slice(0, 5).map((job, i) => (
                                    <JobCard key={job.id} job={job} delay={0.25 + i * 0.05} />
                                ))}
                            </div>
                        )}

                        {/* Active Contracts */}
                        {activeContracts.length > 0 && (
                            <div className="pt-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-white">Active Contracts</h2>
                                    <Link to="/client/contracts" className="text-sm text-zinc-400 hover:text-white transition-colors flex items-center gap-1">
                                        View all <ArrowRight className="w-3 h-3" />
                                    </Link>
                                </div>
                                <div className="space-y-3">
                                    {activeContracts.slice(0, 3).map((contract, i) => (
                                        <ContractCard key={contract.id} contract={contract} delay={0.4 + i * 0.05} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Quick Actions */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-5"
                        >
                            <h3 className="text-sm font-medium text-zinc-400 mb-4">Quick Actions</h3>
                            <div className="space-y-2">
                                <QuickAction href="/client/post-job" icon={Plus} label="Post a New Job" color="indigo" />
                                <QuickAction href="/client/jobs" icon={Briefcase} label="Manage Jobs" color="blue" />
                                <QuickAction href="/client/contracts" icon={CheckCircle2} label="View Contracts" color="purple" />
                                <QuickAction href="/messages" icon={MessageSquare} label="Messages" color="emerald" />
                                <QuickAction href="/talent" icon={Users} label="Browse Talent" color="amber" />
                            </div>
                        </motion.div>

                        {/* Getting Started */}
                        {jobs.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.35 }}
                                className="rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-500/20 p-5"
                            >
                                <div className="flex items-center gap-2 mb-3">
                                    <Zap className="w-4 h-4 text-indigo-400" />
                                    <h3 className="text-sm font-semibold text-white">Getting Started</h3>
                                </div>
                                <div className="space-y-3">
                                    <Step number={1} label="Create a job posting" active />
                                    <Step number={2} label="Review proposals" />
                                    <Step number={3} label="Hire & fund escrow" />
                                </div>
                            </motion.div>
                        )}

                        {/* Platform Stats */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-5"
                        >
                            <h3 className="text-sm font-medium text-zinc-400 mb-4">Your Activity</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-zinc-400">Jobs posted</span>
                                    <span className="text-sm font-medium text-white">{jobs.length}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-zinc-400">Contracts completed</span>
                                    <span className="text-sm font-medium text-white">{contracts.filter(c => c.status === 'completed').length}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-zinc-400">Total spent</span>
                                    <span className="text-sm font-medium text-emerald-400">
                                        ◎{contracts.filter(c => c.status === 'completed').reduce((sum, c) => sum + (c.total_amount || 0), 0).toFixed(1)}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}

// Job Card Component
function JobCard({ job, delay }: { job: Job; delay: number }) {
    const navigate = useNavigate()

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="group relative rounded-2xl bg-white/[0.02] border border-white/[0.06] p-5 hover:bg-white/[0.04] hover:border-white/[0.1] transition-all cursor-pointer"
            onClick={() => navigate(`/client/jobs/${job.id}/proposals`)}
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                        <span className={cn(
                            "px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider",
                            job.status === 'open' ? "bg-emerald-500/20 text-emerald-400" :
                            job.status === 'in_progress' ? "bg-blue-500/20 text-blue-400" :
                            "bg-zinc-500/20 text-zinc-400"
                        )}>
                            {job.status === 'in_progress' ? 'In Progress' : job.status}
                        </span>
                        <span className="text-xs text-zinc-500">
                            <Clock className="w-3 h-3 inline mr-1" />
                            {new Date(job.created_at).toLocaleDateString()}
                        </span>
                    </div>
                    <h3 className="font-semibold text-white group-hover:text-indigo-400 transition-colors truncate mb-1">
                        {job.title}
                    </h3>
                    <div className="flex items-center gap-3 text-sm">
                        <span className="text-zinc-400">{job.budget_type === 'fixed' ? 'Fixed' : 'Hourly'}</span>
                        <span className="text-emerald-400 font-medium">◎{job.budget}</span>
                    </div>
                </div>
                <div className="text-right shrink-0">
                    <div className="text-2xl font-bold text-white mb-1">{job.proposal_count || 0}</div>
                    <div className="text-xs text-zinc-500">proposals</div>
                </div>
            </div>

            <div className="absolute right-5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight className="w-5 h-5 text-zinc-400" />
            </div>
        </motion.div>
    )
}

// Contract Card Component
function ContractCard({ contract, delay }: { contract: Contract; delay: number }) {
    const navigate = useNavigate()
    const completedMilestones = contract.milestones?.filter(m => m.status === 'approved').length || 0
    const totalMilestones = contract.milestones?.length || 1
    const progress = Math.round((completedMilestones / totalMilestones) * 100)

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="group rounded-2xl bg-white/[0.02] border border-white/[0.06] p-5 hover:bg-white/[0.04] hover:border-white/[0.1] transition-all cursor-pointer"
            onClick={() => navigate(`/client/contracts/${contract.id}`)}
        >
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="font-semibold text-white group-hover:text-indigo-400 transition-colors mb-1">
                        {contract.title}
                    </h3>
                    <span className="text-sm text-zinc-400">{contract.freelancer?.display_name}</span>
                </div>
                <span className="text-sm font-semibold text-emerald-400">◎{contract.total_amount}</span>
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500">{completedMilestones}/{totalMilestones} milestones</span>
                    <span className="text-white font-medium">{progress}%</span>
                </div>
                <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        </motion.div>
    )
}

// Quick Action Component
function QuickAction({ href, icon: Icon, label, color }: { href: string; icon: any; label: string; color: string }) {
    const colorClasses: Record<string, string> = {
        indigo: 'group-hover:bg-indigo-500 group-hover:text-white group-hover:border-indigo-500',
        blue: 'group-hover:bg-blue-500 group-hover:text-white group-hover:border-blue-500',
        purple: 'group-hover:bg-purple-500 group-hover:text-white group-hover:border-purple-500',
        emerald: 'group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-500',
        amber: 'group-hover:bg-amber-500 group-hover:text-white group-hover:border-amber-500',
    }

    return (
        <Link
            to={href}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.04] transition-all group"
        >
            <div className={cn(
                "w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center transition-all",
                colorClasses[color]
            )}>
                <Icon className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
            </div>
            <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">{label}</span>
            <ArrowRight className="w-4 h-4 text-zinc-600 ml-auto opacity-0 group-hover:opacity-100 transition-all" />
        </Link>
    )
}

// Step Component
function Step({ number, label, active = false }: { number: number; label: string; active?: boolean }) {
    return (
        <div className="flex items-center gap-3">
            <div className={cn(
                "w-6 h-6 rounded-full text-xs font-semibold flex items-center justify-center",
                active
                    ? "bg-indigo-500 text-white"
                    : "bg-white/[0.06] text-zinc-500"
            )}>
                {number}
            </div>
            <span className={cn("text-sm", active ? "text-white" : "text-zinc-500")}>{label}</span>
        </div>
    )
}
