import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Link, useNavigate } from "react-router-dom"
import {
    DollarSign, Briefcase, FileText, TrendingUp, CheckCircle2,
    Star, Shield, ArrowUpRight, Eye, MessageSquare, Wallet, Zap
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Meteors } from "@/components/ui/meteors"


// Mock data - realistic Web3 freelancer profile
const FREELANCER_DATA = {
    name: "Jordan",
    avatarInitial: "J",
    rating: 4.8,
    reviewCount: 156,
    completedJobs: 89,
    memberSince: "Mar 2024",
    stats: {
        totalEarnings: 8420,
        escrowBalance: 1850,
        activeJobs: 4,
        pendingMilestones: 3,
        proposalsSent: 18,
        proposalsViewed: 7,
    },
    recentActivity: [
        { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10", title: "Payment Received", desc: "420 SOL released for Raydium LP integration milestone", time: "1 hour ago" },
        { icon: FileText, color: "text-blue-400", bg: "bg-blue-500/10", title: "Proposal Shortlisted", desc: "MemeVault DAO shortlisted your proposal - interview scheduled", time: "4 hours ago" },
        { icon: Star, color: "text-amber-400", bg: "bg-amber-500/10", title: "5-Star Review", desc: "SolanaFloor left a review: 'Exceptional work on the sniper bot'", time: "8 hours ago" },
        { icon: Zap, color: "text-purple-400", bg: "bg-purple-500/10", title: "New Contract", desc: "Started work on pump.fun token launcher UI", time: "1 day ago" },
        { icon: MessageSquare, color: "text-indigo-400", bg: "bg-indigo-500/10", title: "Client Message", desc: "Photon Team: 'Can we add Jito bundles to the bot?'", time: "1 day ago" },
    ],
    pendingProposals: [
        { id: 201, jobTitle: "Solana Copy Trading Bot with Helius RPC", client: "AlphaTraders", amount: 650, status: "viewed", daysAgo: 1 },
        { id: 202, jobTitle: "Metaplex Core NFT Minting dApp", client: "PixelPunks Collective", amount: 380, status: "viewed", daysAgo: 2 },
        { id: 203, jobTitle: "DeFi Portfolio Dashboard (Next.js)", client: "SolanaMetrics", amount: 290, status: "sent", daysAgo: 3 },
        { id: 204, jobTitle: "Anchor Program - Token Vesting", client: "LaunchPad DAO", amount: 520, status: "sent", daysAgo: 4 },
    ],
    activeContracts: [
        { id: 301, title: "Raydium AMM Integration for Trading Terminal", client: "Photon Team", progress: 82, escrowAmount: 680, nextMilestone: "Jito Bundle Support" },
        { id: 302, title: "pump.fun Token Launcher Dashboard", client: "MemeFactory", progress: 45, escrowAmount: 420, nextMilestone: "Token Creation Flow" },
        { id: 303, title: "NFT Rarity Sniper with Magic Eden API", client: "SolanaFloor", progress: 95, escrowAmount: 350, nextMilestone: "Final Testing & Deploy" },
        { id: 304, title: "Wallet Analytics Chrome Extension", client: "Solscan Labs", progress: 20, escrowAmount: 280, nextMilestone: "Transaction Parser" },
    ]
}

export function FreelancerDashboard() {
    const navigate = useNavigate()
    const data = FREELANCER_DATA

    return (
        <DashboardLayout role="freelancer">
            {/* Header with Profile Summary */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 animate-fade-in-up">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold font-heading shadow-lg shadow-indigo-500/20">
                        {data.avatarInitial}
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white font-heading tracking-tight">Welcome back, {data.name}</h1>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400">
                                <Star className="w-3.5 h-3.5 fill-current" />
                                <span className="font-semibold">{data.rating}</span>
                                <span className="text-amber-500/70">({data.reviewCount} reviews)</span>
                            </span>
                            <span className="text-zinc-400 font-medium">{data.completedJobs} jobs completed</span>
                        </div>
                    </div>
                </div>
                <Link to="/jobs">
                    <Button className="h-12 px-6 rounded-xl bg-white text-black hover:bg-zinc-200 font-bold transition-all hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.1)] group">
                        Browse New Jobs
                        <ArrowUpRight className="w-4 h-4 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </Button>
                </Link>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
                {/* Total Earnings Card with Meteor Effect */}
                <div className="relative overflow-hidden rounded-2xl bg-[#0a0a0c] border border-white/10 p-5 col-span-1 shadow-2xl">
                    <Meteors number={15} />
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                <DollarSign className="w-5 h-5" />
                            </div>
                            <span className="text-sm text-zinc-400 font-medium uppercase tracking-wide">Total Earnings</span>
                        </div>
                        <div className="text-3xl font-bold text-white mb-2">{data.stats.totalEarnings} SOL</div>
                        <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg w-fit">
                            <TrendingUp className="w-3 h-3" />
                            <span className="font-medium">+12% this month</span>
                        </div>
                    </div>
                </div>

                <StatCard
                    icon={Shield}
                    iconBg="bg-emerald-500/10"
                    iconColor="text-emerald-400"
                    label="In Escrow"
                    value={`${data.stats.escrowBalance} SOL`}
                    subtext="Secured on-chain"
                    delay={0.1}
                />
                <StatCard
                    icon={Briefcase}
                    iconBg="bg-blue-500/10"
                    iconColor="text-blue-400"
                    label="Active Jobs"
                    value={data.stats.activeJobs.toString()}
                    subtext={`${data.stats.pendingMilestones} milestones pending`}
                    delay={0.2}
                />
                <StatCard
                    icon={FileText}
                    iconBg="bg-amber-500/10"
                    iconColor="text-amber-400"
                    label="Proposals"
                    value={data.stats.proposalsSent.toString()}
                    subtext={`${data.stats.proposalsViewed} viewed by clients`}
                    delay={0.3}
                />
            </div>

            {/* Two Column Layout */}
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left Column - Active Contracts */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Active Contracts */}
                    <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-xl font-heading font-semibold text-white tracking-tight">Active Contracts</h2>
                            <Link to="/freelancer/contracts" className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                                View all
                            </Link>
                        </div>
                        <div className="space-y-4">
                            {data.activeContracts.map((contract) => (
                                <div
                                    key={contract.id}
                                    className="group relative p-5 bg-[#0a0a0c] border border-white/5 rounded-2xl hover:border-white/10 transition-all duration-300 overflow-hidden hover:bg-white/[0.02]"
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-5 gap-4">
                                        <div>
                                            <h3 className="font-bold text-white text-lg mb-1">{contract.title}</h3>
                                            <span className="text-sm text-zinc-400 font-medium">{contract.client}</span>
                                        </div>
                                        <div className="text-right flex items-center gap-3 sm:block">
                                            <div className="text-base font-bold text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
                                                <Shield className="w-3.5 h-3.5 fill-current" />
                                                ◎ {contract.escrowAmount}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="mb-4">
                                        <div className="flex justify-between text-xs font-medium mb-2">
                                            <span className="text-zinc-500 uppercase tracking-wider">Milestone Progress</span>
                                            <span className="text-white">{contract.progress}%</span>
                                        </div>
                                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000 ease-out"
                                                style={{ width: `${contract.progress}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                        <span className="text-xs font-medium text-zinc-500">
                                            Next: <span className="text-zinc-300">{contract.nextMilestone}</span>
                                        </span>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-8 text-xs font-medium text-white hover:bg-white/10"
                                            onClick={() => navigate(`/freelancer/contracts/${contract.id}`)}
                                        >
                                            Submit Work
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Pending Proposals */}
                    <div className="animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-xl font-heading font-semibold text-white tracking-tight">Pending Proposals</h2>
                            <Link to="/freelancer/proposals" className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                                View all
                            </Link>
                        </div>
                        <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl divide-y divide-white/5 overflow-hidden">
                            {data.pendingProposals.map((proposal) => (
                                <div
                                    key={proposal.id}
                                    className="p-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-2.5 h-2.5 rounded-full ring-4 ring-black",
                                            proposal.status === "viewed" ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-zinc-600"
                                        )} />
                                        <div>
                                            <h4 className="text-sm font-semibold text-white group-hover:text-indigo-400 transition-colors">{proposal.jobTitle}</h4>
                                            <span className="text-xs text-zinc-500 font-medium">{proposal.client}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-bold text-white mb-0.5">◎ {proposal.amount}</div>
                                        <div className="flex items-center justify-end gap-1 text-xs">
                                            {proposal.status === "viewed" ? (
                                                <span className="text-emerald-400 flex items-center gap-1 font-medium bg-emerald-500/10 px-1.5 py-0.5 rounded">
                                                    <Eye className="w-3 h-3" /> Viewed
                                                </span>
                                            ) : (
                                                <span className="text-zinc-500">{proposal.daysAgo}d ago</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column - Activity & Quick Actions */}
                <div className="space-y-8">
                    {/* Quick Actions */}
                    <div className="p-6 bg-[#0a0a0c] border border-white/5 rounded-2xl animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4">Quick Actions</h3>
                        <div className="space-y-2">
                            <Link to="/escrow" className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all group">
                                <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center group-hover:bg-indigo-500 group-hover:border-indigo-500 transition-colors">
                                    <Wallet className="w-4 h-4 text-zinc-400 group-hover:text-white" />
                                </div>
                                <span className="text-sm font-medium text-white">Escrow Balance</span>
                            </Link>
                            <Link to="/freelancer/proposals" className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all group">
                                <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center group-hover:bg-blue-500 group-hover:border-blue-500 transition-colors">
                                    <FileText className="w-4 h-4 text-zinc-400 group-hover:text-white" />
                                </div>
                                <span className="text-sm font-medium text-white">Track Proposals</span>
                            </Link>
                            <Link to="/freelancer/contracts" className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all group">
                                <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center group-hover:bg-purple-500 group-hover:border-purple-500 transition-colors">
                                    <Briefcase className="w-4 h-4 text-zinc-400 group-hover:text-white" />
                                </div>
                                <span className="text-sm font-medium text-white">Active Contracts</span>
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
                    <div className="animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
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
    delay = 0
}: {
    icon: any
    iconBg: string
    iconColor: string
    label: string
    value: string
    subtext?: string
    delay?: number
}) {
    return (
        <div
            className="group relative bg-[#0a0a0c] border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 animate-fade-in-up"
            style={{ animationDelay: `${delay}s` }}
        >
            <div className="flex items-center gap-3 mb-4">
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110", iconBg)}>
                    <Icon className={cn("w-5 h-5", iconColor)} />
                </div>
                <span className="text-sm text-zinc-400 font-medium uppercase tracking-wide">{label}</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors">{value}</div>

            {subtext && (
                <div className="text-xs text-zinc-500 font-medium">{subtext}</div>
            )}

            {/* Hover Glow */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </div>
    )
}
