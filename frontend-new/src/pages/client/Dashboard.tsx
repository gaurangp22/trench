import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Link } from "react-router-dom"
import {
    DollarSign, Briefcase, Users, Clock, CheckCircle2,
    Shield, Eye, MessageSquare, Wallet, Plus, AlertCircle, ArrowUpRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Meteors } from "@/components/ui/meteors"

// Mock data - in production, fetch from API
const CLIENT_DATA = {
    name: "Sarah",
    company: "DeFi Protocol X",
    avatarInitial: "S",
    memberSince: "Nov 2023",
    stats: {
        totalSpent: 4250,
        escrowFunded: 520,
        activeJobs: 4,
        pendingApprovals: 2,
        totalHires: 18,
        openProposals: 32,
    },
    pendingApprovals: [
        { id: 1, jobTitle: "Solana API Integration", freelancer: "Alex D.", amount: 50, milestone: "API Testing Phase", submittedAgo: "2 hours" },
        { id: 2, jobTitle: "Smart Contract Audit", freelancer: "Maya R.", amount: 75, milestone: "Initial Review", submittedAgo: "1 day" },
    ],
    activeJobs: [
        { id: 1, title: "Solana API Integration", freelancer: "Alex D.", progress: 65, escrowAmount: 150, status: "in_progress" },
        { id: 2, title: "Frontend UI for NFT Marketplace", freelancer: "Jordan K.", progress: 45, escrowAmount: 85, status: "in_progress" },
        { id: 3, title: "Smart Contract Audit", freelancer: "Maya R.", progress: 25, escrowAmount: 120, status: "awaiting_review" },
        { id: 4, title: "Token Economics Design", freelancer: null, proposalCount: 12, status: "hiring" },
    ],
    recentActivity: [
        { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10", title: "Milestone Submitted", desc: "Alex D. submitted 'API Testing Phase' for review", time: "2 hours ago" },
        { icon: Users, color: "text-blue-400", bg: "bg-blue-500/10", title: "New Proposal", desc: "5 new proposals received for 'Token Economics Design'", time: "4 hours ago" },
        { icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10", title: "Payment Released", desc: "50 SOL released to Jordan K. for UI milestone", time: "1 day ago" },
        { icon: MessageSquare, color: "text-purple-400", bg: "bg-purple-500/10", title: "New Message", desc: "Maya R. has a question about audit scope", time: "1 day ago" },
    ],
    spendingByMonth: [
        { month: "Oct", amount: 320 },
        { month: "Nov", amount: 580 },
        { month: "Dec", amount: 890 },
        { month: "Jan", amount: 520 },
    ]
}

export function ClientDashboard() {
    const data = CLIENT_DATA

    return (
        <DashboardLayout role="client">
            {/* Header with Profile Summary */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 animate-fade-in-up">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white text-2xl font-bold font-heading shadow-lg shadow-cyan-500/20">
                        {data.avatarInitial}
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white font-heading tracking-tight">Welcome, {data.name}</h1>
                        <div className="flex items-center gap-2 mt-2 text-sm text-zinc-400">
                            <span className="font-medium text-white">{data.company}</span>
                            <span className="text-zinc-600">•</span>
                            <span>{data.stats.totalHires} hires</span>
                        </div>
                    </div>
                </div>
                <Link to="/client/post-job">
                    <Button className="h-12 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90 font-bold transition-all hover:scale-105 shadow-[0_0_20px_rgba(99,102,241,0.3)] group">
                        <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
                        Post New Job
                    </Button>
                </Link>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
                {/* Total Spent Card with Meteor Effect */}
                <div className="relative overflow-hidden rounded-2xl bg-[#0a0a0c] border border-white/10 p-5 col-span-1 shadow-2xl group hover:border-white/20 transition-all">
                    <Meteors number={15} />
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                                <DollarSign className="w-5 h-5" />
                            </div>
                            <span className="text-sm text-zinc-400 font-medium uppercase tracking-wide">Total Spent</span>
                        </div>
                        <div className="text-3xl font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors">{data.stats.totalSpent} SOL</div>
                    </div>
                </div>

                <StatCard
                    icon={Shield}
                    iconBg="bg-emerald-500/10"
                    iconColor="text-emerald-400"
                    label="In Escrow"
                    value={`${data.stats.escrowFunded} SOL`}
                    subtext="Secured for active jobs"
                    delay={0.1}
                />
                <StatCard
                    icon={Briefcase}
                    iconBg="bg-blue-500/10"
                    iconColor="text-blue-400"
                    label="Active Jobs"
                    value={data.stats.activeJobs.toString()}
                    subtext={`${data.stats.pendingApprovals} pending approvals`}
                    highlight={data.stats.pendingApprovals > 0}
                    delay={0.2}
                />
                <StatCard
                    icon={Users}
                    iconBg="bg-amber-500/10"
                    iconColor="text-amber-400"
                    label="Open Proposals"
                    value={data.stats.openProposals.toString()}
                    subtext="Awaiting your review"
                    delay={0.3}
                />
            </div>

            {/* Pending Approvals Alert */}
            {data.pendingApprovals.length > 0 && (
                <div className="mb-8 p-1 rounded-2xl bg-gradient-to-r from-amber-500/20 via-transparent to-transparent animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                    <div className="p-5 bg-[#0a0a0c] border border-amber-500/20 rounded-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                        <div className="flex items-start gap-4 relative z-10">
                            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0 animate-pulse">
                                <AlertCircle className="w-5 h-5 text-amber-500" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                                    Action Required <span className="text-amber-500 font-medium text-sm">({data.pendingApprovals.length} pending approvals)</span>
                                </h3>
                                <div className="space-y-2">
                                    {data.pendingApprovals.map((approval) => (
                                        <div key={approval.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-amber-500/30 transition-colors gap-4">
                                            <div className="space-y-1">
                                                <div className="text-sm font-medium text-white">{approval.jobTitle}</div>
                                                <div className="flex items-center gap-2 text-xs text-zinc-400">
                                                    <span>by <span className="text-zinc-200">{approval.freelancer}</span></span>
                                                    <span>•</span>
                                                    <span>{approval.submittedAgo} ago</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-sm font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">◎ {approval.amount}</span>
                                                <Button size="sm" className="h-9 px-4 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-black rounded-lg">
                                                    Review & Approve
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Two Column Layout */}
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left Column - Active Jobs */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Active Jobs */}
                    <div className="animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-xl font-heading font-semibold text-white tracking-tight">Active Jobs</h2>
                            <Link to="/client/jobs" className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                                View all
                            </Link>
                        </div>
                        <div className="space-y-4">
                            {data.activeJobs.map((job) => (
                                <div
                                    key={job.id}
                                    className="group relative p-5 bg-[#0a0a0c] border border-white/5 rounded-2xl hover:border-white/10 transition-all duration-300 hover:bg-white/[0.02]"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="font-bold text-white text-lg mb-1 group-hover:text-indigo-400 transition-colors">{job.title}</h3>
                                            {job.freelancer ? (
                                                <span className="text-sm text-zinc-400 font-medium">Hired: <span className="text-zinc-200">{job.freelancer}</span></span>
                                            ) : (
                                                <span className="text-sm text-blue-400 font-medium bg-blue-500/10 px-2 py-0.5 rounded">{job.proposalCount} proposals received</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {job.status === "awaiting_review" && (
                                                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                                    Review Needed
                                                </span>
                                            )}
                                            {job.status === "hiring" && (
                                                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                                    Hiring
                                                </span>
                                            )}
                                            {job.escrowAmount && (
                                                <div className="text-right hidden sm:block">
                                                    <div className="text-sm font-bold text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-2 py-1 rounded-lg">
                                                        <Shield className="w-3.5 h-3.5 fill-current" />
                                                        ◎ {job.escrowAmount}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Progress Bar for in-progress jobs */}
                                    {job.progress !== undefined && (
                                        <div className="mb-4">
                                            <div className="flex justify-between text-xs font-medium mb-2">
                                                <span className="text-zinc-500 uppercase tracking-wider">Completion</span>
                                                <span className="text-white">{job.progress}%</span>
                                            </div>
                                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full transition-all duration-1000"
                                                    style={{ width: `${job.progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/5">
                                        {job.status === "awaiting_review" ? (
                                            <Button size="sm" className="h-8 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-black">
                                                Review Work
                                            </Button>
                                        ) : job.status === "hiring" ? (
                                            <Button size="sm" variant="outline" className="h-8 text-xs border-white/10 text-zinc-300 hover:text-white hover:bg-white/5">
                                                <Eye className="w-3 h-3 mr-1.5" /> View Proposals
                                            </Button>
                                        ) : (
                                            <Button size="sm" variant="ghost" className="h-8 text-xs text-zinc-400 hover:text-white hover:bg-white/5">
                                                View Details <ArrowUpRight className="w-3 h-3 ml-1" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Spending Analytics */}
                    <div className="animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                        <h2 className="text-xl font-heading font-semibold text-white tracking-tight mb-5">Spending Overview</h2>
                        <div className="p-6 bg-[#0a0a0c] border border-white/5 rounded-2xl relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent opacity-50" />
                            <div className="flex items-end justify-between h-40 gap-4 relative z-10">
                                {data.spendingByMonth.map((month, i) => {
                                    const maxAmount = Math.max(...data.spendingByMonth.map(m => m.amount))
                                    const height = (month.amount / maxAmount) * 100
                                    return (
                                        <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                                            <div className="w-full flex flex-col items-center justify-end h-full">
                                                <span className="text-xs font-bold text-white mb-2 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">◎{month.amount}</span>
                                                <div
                                                    className={cn(
                                                        "w-full rounded-t-lg transition-all duration-500 hover:brightness-125",
                                                        i === data.spendingByMonth.length - 1
                                                            ? "bg-gradient-to-t from-indigo-500 via-purple-500 to-cyan-400 shadow-[0_0_20px_rgba(99,102,241,0.3)]"
                                                            : "bg-white/10 group-hover:bg-white/20"
                                                    )}
                                                    style={{ height: `${height}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{month.month}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Activity & Quick Actions */}
                <div className="space-y-8">
                    {/* Quick Actions */}
                    <div className="p-6 bg-[#0a0a0c] border border-white/5 rounded-2xl animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
                        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4">Quick Actions</h3>
                        <div className="space-y-2">
                            <Link to="/escrow" className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all group">
                                <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center group-hover:bg-indigo-500 group-hover:border-indigo-500 transition-colors">
                                    <Wallet className="w-4 h-4 text-zinc-400 group-hover:text-white" />
                                </div>
                                <span className="text-sm font-medium text-white">View Escrow Funds</span>
                            </Link>
                            <Link to="/client/jobs" className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all group">
                                <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center group-hover:bg-blue-500 group-hover:border-blue-500 transition-colors">
                                    <Briefcase className="w-4 h-4 text-zinc-400 group-hover:text-white" />
                                </div>
                                <span className="text-sm font-medium text-white">Manage Jobs</span>
                            </Link>
                            <Link to="/messages" className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all group">
                                <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center group-hover:bg-emerald-500 group-hover:border-emerald-500 transition-colors">
                                    <MessageSquare className="w-4 h-4 text-zinc-400 group-hover:text-white" />
                                </div>
                                <span className="text-sm font-medium text-white">Messages</span>
                            </Link>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
                        <h2 className="text-xl font-heading font-semibold text-white tracking-tight mb-5">Recent Activity</h2>
                        <div className="space-y-4">
                            {data.recentActivity.map((item, i) => (
                                <div key={i} className="relative pl-6 pb-4 border-l border-white/10 last:pb-0 last:border-0">
                                    <div className={cn(
                                        "absolute left-[-1.3rem] w-10 h-10 rounded-full border-4 border-[#020204] flex items-center justify-center",
                                        item.bg
                                    )}>
                                        <item.icon className={cn("w-4 h-4", item.color)} />
                                    </div>
                                    <div className="mb-0.5">
                                        <h4 className="text-sm font-bold text-white leading-none">{item.title}</h4>
                                        <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider ml-auto block mt-1">{item.time}</span>
                                    </div>
                                    <p className="text-xs text-zinc-400 leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}

// Stat Card Component
function StatCard({
    icon: Icon,
    iconBg,
    iconColor,
    label,
    value,
    subtext,
    highlight,
    delay = 0
}: {
    icon: any
    iconBg: string
    iconColor: string
    label: string
    value: string
    subtext?: string
    highlight?: boolean
    delay?: number
}) {
    return (
        <div
            className={cn(
                "group relative bg-[#0a0a0c] border rounded-2xl p-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 animate-fade-in-up",
                highlight ? "border-amber-500/30 bg-amber-500/5 shadow-[0_0_20px_rgba(245,158,11,0.1)]" : "border-white/10 hover:border-white/20"
            )}
            style={{ animationDelay: `${delay}s` }}
        >
            <div className="flex items-center gap-3 mb-4">
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110", iconBg)}>
                    <Icon className={cn("w-5 h-5", iconColor)} />
                </div>
                <span className="text-sm text-zinc-400 font-medium uppercase tracking-wide">{label}</span>
            </div>
            <div className={cn("text-2xl font-bold mb-1 transition-colors", highlight ? "text-amber-400" : "text-white group-hover:text-indigo-400")}>{value}</div>

            {subtext && (
                <div className={cn(
                    "text-xs font-medium",
                    highlight ? "text-amber-400/80" : "text-zinc-500"
                )}>{subtext}</div>
            )}

            {/* Hover Glow */}
            {!highlight && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            )}
        </div>
    )
}
