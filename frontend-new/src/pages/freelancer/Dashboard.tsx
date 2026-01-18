import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Link } from "react-router-dom"
import {
    DollarSign, Briefcase, FileText, TrendingUp, Clock, CheckCircle2,
    Star, Shield, ArrowUpRight, Eye, MessageSquare, Wallet
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Mock data - in production, fetch from API
const FREELANCER_DATA = {
    name: "Alex",
    avatarInitial: "A",
    rating: 4.9,
    reviewCount: 47,
    completedJobs: 32,
    memberSince: "Jan 2024",
    stats: {
        totalEarnings: 1250,
        escrowBalance: 320,
        activeJobs: 3,
        pendingMilestones: 2,
        proposalsSent: 12,
        proposalsViewed: 4,
    },
    recentActivity: [
        { icon: CheckCircle2, color: "text-green-400", title: "Milestone Approved", desc: "Payment of 50 SOL released for 'Solana API Integration'", time: "2 hours ago" },
        { icon: FileText, color: "text-blue-400", title: "Proposal Viewed", desc: "Client viewed your proposal for 'Rust Smart Contract Audit'", time: "5 hours ago" },
        { icon: Clock, color: "text-yellow-400", title: "Contract Started", desc: "You started working on 'Frontend UI for NFT Marketplace'", time: "1 day ago" },
        { icon: MessageSquare, color: "text-purple-400", title: "New Message", desc: "DeFi Protocol X sent you a message about the milestone", time: "1 day ago" },
    ],
    pendingProposals: [
        { id: 1, jobTitle: "Rust Smart Contract Audit", client: "Security DAO", amount: 120, status: "viewed", daysAgo: 2 },
        { id: 2, jobTitle: "Solana NFT Marketplace", client: "NFT Collective", amount: 85, status: "sent", daysAgo: 3 },
        { id: 3, jobTitle: "DeFi Dashboard UI", client: "Yield Protocol", amount: 45, status: "sent", daysAgo: 5 },
    ],
    activeContracts: [
        { id: 1, title: "Solana API Integration", client: "DeFi Protocol X", progress: 65, escrowAmount: 150, nextMilestone: "API Testing" },
        { id: 2, title: "Frontend UI for NFT Marketplace", client: "NFT Collective", progress: 25, escrowAmount: 85, nextMilestone: "Component Library" },
        { id: 3, title: "Smart Contract Security Review", client: "Security DAO", progress: 10, escrowAmount: 120, nextMilestone: "Initial Audit" },
    ]
}

export function FreelancerDashboard() {
    const data = FREELANCER_DATA

    return (
        <DashboardLayout role="freelancer">
            {/* Header with Profile Summary */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xl font-bold">
                        {data.avatarInitial}
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-white">Welcome back, {data.name}</h1>
                        <div className="flex items-center gap-4 mt-1">
                            <span className="flex items-center gap-1 text-amber-400">
                                <Star className="w-4 h-4 fill-current" />
                                <span className="font-medium">{data.rating}</span>
                                <span className="text-zinc-500">({data.reviewCount} reviews)</span>
                            </span>
                            <span className="text-zinc-500">{data.completedJobs} jobs completed</span>
                        </div>
                    </div>
                </div>
                <Link to="/jobs">
                    <Button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                        Browse New Jobs
                        <ArrowUpRight className="w-4 h-4 ml-2" />
                    </Button>
                </Link>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <StatCard
                    icon={DollarSign}
                    iconBg="bg-purple-500/10"
                    iconColor="text-purple-400"
                    label="Total Earnings"
                    value={`${data.stats.totalEarnings} SOL`}
                    trend="+12%"
                    trendUp={true}
                />
                <StatCard
                    icon={Shield}
                    iconBg="bg-emerald-500/10"
                    iconColor="text-emerald-400"
                    label="In Escrow"
                    value={`${data.stats.escrowBalance} SOL`}
                    subtext="Secured on-chain"
                />
                <StatCard
                    icon={Briefcase}
                    iconBg="bg-blue-500/10"
                    iconColor="text-blue-400"
                    label="Active Jobs"
                    value={data.stats.activeJobs.toString()}
                    subtext={`${data.stats.pendingMilestones} milestones pending`}
                />
                <StatCard
                    icon={FileText}
                    iconBg="bg-amber-500/10"
                    iconColor="text-amber-400"
                    label="Proposals"
                    value={data.stats.proposalsSent.toString()}
                    subtext={`${data.stats.proposalsViewed} viewed by clients`}
                />
            </div>

            {/* Two Column Layout */}
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left Column - Active Contracts */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Active Contracts */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-white">Active Contracts</h2>
                            <Link to="/freelancer/contracts" className="text-sm text-purple-400 hover:text-purple-300">
                                View all
                            </Link>
                        </div>
                        <div className="space-y-3">
                            {data.activeContracts.map((contract) => (
                                <div
                                    key={contract.id}
                                    className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h3 className="font-medium text-white">{contract.title}</h3>
                                            <span className="text-sm text-zinc-400">{contract.client}</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-medium text-emerald-400 flex items-center gap-1">
                                                <Shield className="w-3 h-3" />
                                                ◎ {contract.escrowAmount}
                                            </div>
                                            <span className="text-xs text-zinc-500">in escrow</span>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="mb-2">
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-zinc-400">Progress</span>
                                            <span className="text-zinc-400">{contract.progress}%</span>
                                        </div>
                                        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
                                                style={{ width: `${contract.progress}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-zinc-500">
                                            Next: {contract.nextMilestone}
                                        </span>
                                        <Button size="sm" variant="outline" className="h-7 text-xs border-zinc-700">
                                            Submit Work
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Pending Proposals */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-white">Pending Proposals</h2>
                            <Link to="/freelancer/proposals" className="text-sm text-purple-400 hover:text-purple-300">
                                View all
                            </Link>
                        </div>
                        <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl divide-y divide-zinc-800">
                            {data.pendingProposals.map((proposal) => (
                                <div
                                    key={proposal.id}
                                    className="p-4 flex items-center justify-between hover:bg-zinc-900/50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-2 h-2 rounded-full",
                                            proposal.status === "viewed" ? "bg-green-500" : "bg-zinc-500"
                                        )} />
                                        <div>
                                            <h4 className="text-sm font-medium text-white">{proposal.jobTitle}</h4>
                                            <span className="text-xs text-zinc-500">{proposal.client}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <div className="text-sm font-medium text-white">◎ {proposal.amount}</div>
                                            <div className="flex items-center gap-1 text-xs">
                                                {proposal.status === "viewed" ? (
                                                    <span className="text-green-400 flex items-center gap-1">
                                                        <Eye className="w-3 h-3" /> Viewed
                                                    </span>
                                                ) : (
                                                    <span className="text-zinc-500">{proposal.daysAgo}d ago</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
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
                                <span className="text-sm text-white">View Escrow Balance</span>
                            </Link>
                            <Link to="/freelancer/proposals" className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-800/50 transition-colors">
                                <FileText className="w-5 h-5 text-blue-400" />
                                <span className="text-sm text-white">Track Proposals</span>
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
    trend,
    trendUp,
    subtext
}: {
    icon: any
    iconBg: string
    iconColor: string
    label: string
    value: string
    trend?: string
    trendUp?: boolean
    subtext?: string
}) {
    return (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
                <div className={cn("w-9 h-9 rounded-full flex items-center justify-center", iconBg)}>
                    <Icon className={cn("w-4 h-4", iconColor)} />
                </div>
                <span className="text-xs text-zinc-400 font-medium">{label}</span>
            </div>
            <div className="text-2xl font-bold text-white">{value}</div>
            {trend && (
                <div className={cn(
                    "flex items-center gap-1 mt-1 text-xs",
                    trendUp ? "text-green-400" : "text-red-400"
                )}>
                    <TrendingUp className="w-3 h-3" />
                    <span>{trend} this month</span>
                </div>
            )}
            {subtext && (
                <div className="text-xs text-zinc-500 mt-1">{subtext}</div>
            )}
        </div>
    )
}
