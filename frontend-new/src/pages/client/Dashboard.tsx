import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Link } from "react-router-dom"
import {
    DollarSign, Briefcase, Users, Clock, CheckCircle2,
    Shield, Eye, MessageSquare, Wallet, Plus, AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

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
        { icon: CheckCircle2, color: "text-green-400", title: "Milestone Submitted", desc: "Alex D. submitted 'API Testing Phase' for review", time: "2 hours ago" },
        { icon: Users, color: "text-blue-400", title: "New Proposal", desc: "5 new proposals received for 'Token Economics Design'", time: "4 hours ago" },
        { icon: Clock, color: "text-yellow-400", title: "Payment Released", desc: "50 SOL released to Jordan K. for UI milestone", time: "1 day ago" },
        { icon: MessageSquare, color: "text-purple-400", title: "New Message", desc: "Maya R. has a question about audit scope", time: "1 day ago" },
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xl font-bold">
                        {data.avatarInitial}
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-white">Welcome, {data.name}</h1>
                        <div className="flex items-center gap-4 mt-1">
                            <span className="text-zinc-400">{data.company}</span>
                            <span className="text-zinc-500">•</span>
                            <span className="text-zinc-500">{data.stats.totalHires} hires since {data.memberSince}</span>
                        </div>
                    </div>
                </div>
                <Link to="/client/post-job">
                    <Button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Post New Job
                    </Button>
                </Link>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <StatCard
                    icon={DollarSign}
                    iconBg="bg-purple-500/10"
                    iconColor="text-purple-400"
                    label="Total Spent"
                    value={`${data.stats.totalSpent} SOL`}
                />
                <StatCard
                    icon={Shield}
                    iconBg="bg-emerald-500/10"
                    iconColor="text-emerald-400"
                    label="In Escrow"
                    value={`${data.stats.escrowFunded} SOL`}
                    subtext="Secured for active jobs"
                />
                <StatCard
                    icon={Briefcase}
                    iconBg="bg-blue-500/10"
                    iconColor="text-blue-400"
                    label="Active Jobs"
                    value={data.stats.activeJobs.toString()}
                    subtext={`${data.stats.pendingApprovals} pending approvals`}
                    highlight={data.stats.pendingApprovals > 0}
                />
                <StatCard
                    icon={Users}
                    iconBg="bg-amber-500/10"
                    iconColor="text-amber-400"
                    label="Open Proposals"
                    value={data.stats.openProposals.toString()}
                    subtext="Awaiting your review"
                />
            </div>

            {/* Pending Approvals Alert */}
            {data.pendingApprovals.length > 0 && (
                <div className="mb-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <h3 className="font-medium text-amber-400 mb-2">
                                {data.pendingApprovals.length} milestone(s) awaiting your approval
                            </h3>
                            <div className="space-y-2">
                                {data.pendingApprovals.map((approval) => (
                                    <div key={approval.id} className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-lg">
                                        <div>
                                            <span className="text-sm text-white">{approval.jobTitle}</span>
                                            <span className="text-sm text-zinc-500 ml-2">by {approval.freelancer}</span>
                                            <span className="text-xs text-zinc-500 ml-2">• {approval.submittedAgo} ago</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-medium text-white">◎ {approval.amount}</span>
                                            <Button size="sm" className="h-7 text-xs bg-emerald-500 hover:bg-emerald-600 text-white">
                                                Review & Approve
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Two Column Layout */}
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left Column - Active Jobs */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Active Jobs */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-white">Active Jobs</h2>
                            <Link to="/client/jobs" className="text-sm text-purple-400 hover:text-purple-300">
                                View all
                            </Link>
                        </div>
                        <div className="space-y-3">
                            {data.activeJobs.map((job) => (
                                <div
                                    key={job.id}
                                    className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h3 className="font-medium text-white">{job.title}</h3>
                                            {job.freelancer ? (
                                                <span className="text-sm text-zinc-400">Hired: {job.freelancer}</span>
                                            ) : (
                                                <span className="text-sm text-blue-400">{job.proposalCount} proposals received</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {job.status === "awaiting_review" && (
                                                <span className="px-2 py-1 rounded text-xs bg-amber-500/10 text-amber-400">
                                                    Awaiting Review
                                                </span>
                                            )}
                                            {job.status === "hiring" && (
                                                <span className="px-2 py-1 rounded text-xs bg-blue-500/10 text-blue-400">
                                                    Hiring
                                                </span>
                                            )}
                                            {job.escrowAmount && (
                                                <div className="text-right">
                                                    <div className="text-sm font-medium text-emerald-400 flex items-center gap-1">
                                                        <Shield className="w-3 h-3" />
                                                        ◎ {job.escrowAmount}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Progress Bar for in-progress jobs */}
                                    {job.progress !== undefined && (
                                        <div className="mb-2">
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="text-zinc-400">Progress</span>
                                                <span className="text-zinc-400">{job.progress}%</span>
                                            </div>
                                            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
                                                    style={{ width: `${job.progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-end gap-2 mt-3">
                                        {job.status === "awaiting_review" ? (
                                            <Button size="sm" className="h-7 text-xs bg-emerald-500 hover:bg-emerald-600">
                                                Review Work
                                            </Button>
                                        ) : job.status === "hiring" ? (
                                            <Button size="sm" variant="outline" className="h-7 text-xs border-zinc-700">
                                                <Eye className="w-3 h-3 mr-1" /> View Proposals
                                            </Button>
                                        ) : (
                                            <Button size="sm" variant="outline" className="h-7 text-xs border-zinc-700">
                                                View Details
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Spending Analytics */}
                    <div>
                        <h2 className="text-lg font-semibold text-white mb-4">Spending Overview</h2>
                        <div className="p-5 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                            <div className="flex items-end justify-between h-32 gap-4">
                                {data.spendingByMonth.map((month, i) => {
                                    const maxAmount = Math.max(...data.spendingByMonth.map(m => m.amount))
                                    const height = (month.amount / maxAmount) * 100
                                    return (
                                        <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                            <div className="w-full flex flex-col items-center justify-end h-24">
                                                <span className="text-xs text-zinc-400 mb-1">◎{month.amount}</span>
                                                <div
                                                    className={cn(
                                                        "w-full rounded-t-lg transition-all",
                                                        i === data.spendingByMonth.length - 1
                                                            ? "bg-gradient-to-t from-purple-500 to-pink-500"
                                                            : "bg-zinc-700"
                                                    )}
                                                    style={{ height: `${height}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-zinc-500">{month.month}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Activity & Quick Actions */}
                <div className="space-y-6">
                    {/* Quick Actions */}
                    <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                        <h3 className="text-sm font-medium text-zinc-400 mb-3">Quick Actions</h3>
                        <div className="space-y-2">
                            <Link to="/escrow" className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-800/50 transition-colors">
                                <Wallet className="w-5 h-5 text-purple-400" />
                                <span className="text-sm text-white">View Escrow Funds</span>
                            </Link>
                            <Link to="/client/jobs" className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-800/50 transition-colors">
                                <Briefcase className="w-5 h-5 text-blue-400" />
                                <span className="text-sm text-white">Manage Jobs</span>
                            </Link>
                            <Link to="/messages" className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-800/50 transition-colors">
                                <MessageSquare className="w-5 h-5 text-green-400" />
                                <span className="text-sm text-white">Messages</span>
                            </Link>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div>
                        <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
                        <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl divide-y divide-zinc-800">
                            {data.recentActivity.map((item, i) => (
                                <div key={i} className="p-3 flex items-start gap-3 hover:bg-zinc-900/50 transition-colors">
                                    <div className={`mt-0.5 ${item.color}`}>
                                        <item.icon className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-medium text-white">{item.title}</h4>
                                        <p className="text-xs text-zinc-400 mt-0.5 truncate">{item.desc}</p>
                                    </div>
                                    <span className="text-xs text-zinc-500 whitespace-nowrap">{item.time}</span>
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
    highlight
}: {
    icon: any
    iconBg: string
    iconColor: string
    label: string
    value: string
    subtext?: string
    highlight?: boolean
}) {
    return (
        <div className={cn(
            "bg-zinc-900/50 border rounded-xl p-4",
            highlight ? "border-amber-500/50" : "border-zinc-800"
        )}>
            <div className="flex items-center gap-3 mb-3">
                <div className={cn("w-9 h-9 rounded-full flex items-center justify-center", iconBg)}>
                    <Icon className={cn("w-4 h-4", iconColor)} />
                </div>
                <span className="text-xs text-zinc-400 font-medium">{label}</span>
            </div>
            <div className="text-2xl font-bold text-white">{value}</div>
            {subtext && (
                <div className={cn(
                    "text-xs mt-1",
                    highlight ? "text-amber-400" : "text-zinc-500"
                )}>{subtext}</div>
            )}
        </div>
    )
}
