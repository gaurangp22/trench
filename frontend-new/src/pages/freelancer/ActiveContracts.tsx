import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/button"
import { MessageSquare, ExternalLink, Clock, CheckCircle } from "lucide-react"
import { BorderBeam } from "@/components/ui/border-beam"
import { cn } from "@/lib/utils"

// Mock Contracts
const MOCK_CONTRACTS = [
    {
        id: 1,
        title: "Frontend UI for NFT Marketplace",
        client: "Magic Eden",
        rate: "25 SOL/hr",
        hoursLogged: "12:30",
        totalEarned: "312.5 SOL",
        status: "Active",
        startDate: "Jan 10, 2026",
        gradient: "from-indigo-500/20 via-purple-500/20 to-indigo-500/20",
        beamColor: "#818cf8"
    },
    {
        id: 2,
        title: "Solana Smart Contract Integration",
        client: "Helium Foundation",
        rate: "Fixed Price",
        amount: "500 SOL",
        paid: "250 SOL",
        remaining: "250 SOL",
        status: "In Progress",
        startDate: "Jan 15, 2026",
        gradient: "from-emerald-500/20 via-teal-500/20 to-emerald-500/20",
        beamColor: "#34d399"
    }
]

export function ActiveContracts() {
    return (
        <DashboardLayout role="freelancer">
            <div className="mb-10 animate-fade-in-up">
                <h1 className="text-4xl font-heading font-semibold text-white mb-2 tracking-tight">Active Contracts</h1>
                <p className="text-zinc-400 text-lg">Manage your current work and payments.</p>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {MOCK_CONTRACTS.map((contract) => (
                    <div
                        key={contract.id}
                        className="group relative bg-[#0a0a0c] border border-white/5 rounded-3xl overflow-hidden hover:border-white/10 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1"
                    >
                        {/* Electric Border Beam for Active Contracts */}
                        <BorderBeam
                            duration={12}
                            size={400}
                            color={contract.beamColor}
                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        />

                        {/* Subtle Background Gradient */}
                        <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl", contract.gradient)} />

                        <div className="relative z-10 p-8">
                            <div className="flex flex-col md:flex-row justify-between gap-6 mb-8">
                                <div>
                                    <div className="flex items-center gap-3 mb-3">
                                        <h3 className="text-2xl font-bold text-white font-heading tracking-tight">{contract.title}</h3>
                                        <span className={cn(
                                            "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border",
                                            contract.status === "Active"
                                                ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                                                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                        )}>
                                            {contract.status}
                                        </span>
                                    </div>
                                    <p className="text-zinc-400 text-base">Client: <span className="text-white font-medium">{contract.client}</span> • Started {contract.startDate}</p>
                                </div>
                                <div className="flex gap-3">
                                    <Button variant="ghost" className="h-12 px-6 rounded-xl border border-white/5 text-zinc-400 hover:text-white hover:bg-white/5 font-medium transition-all">
                                        <MessageSquare className="w-5 h-5 mr-2" />
                                        Message
                                    </Button>
                                    <Button className="h-12 px-6 rounded-xl bg-white text-black hover:bg-zinc-200 font-bold transition-all hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                                        <ExternalLink className="w-5 h-5 mr-2" />
                                        Open Workroom
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-black/20 backdrop-blur-md rounded-2xl border border-white/5">
                                {contract.rate.includes('/hr') ? (
                                    <>
                                        <div>
                                            <div className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-2">Rate</div>
                                            <div className="text-xl text-white font-semibold flex items-center gap-2">
                                                {contract.rate}
                                                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-2">Hours This Week</div>
                                            <div className="text-xl text-white font-semibold flex items-center gap-2">
                                                <Clock className="w-5 h-5 text-indigo-400" />
                                                {contract.hoursLogged}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-2">Total Earned</div>
                                            <div className="text-xl text-emerald-400 font-semibold">{contract.totalEarned}</div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div>
                                            <div className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-2">Total Budget</div>
                                            <div className="text-xl text-white font-semibold flex items-center gap-2">
                                                {contract.amount}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-2">Paid</div>
                                            <div className="text-xl text-emerald-400 font-semibold flex items-center gap-2">
                                                <CheckCircle className="w-5 h-5" />
                                                {contract.paid}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-2">Remaining</div>
                                            <div className="text-xl text-zinc-400 font-semibold">{contract.remaining}</div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Recent Activity Mini-feed */}
                        < div className="bg-white/5 px-6 py-3 border-t border-white/5 flex items-center justify-between text-sm backdrop-blur-md" >
                            <span className="text-muted-foreground">Last activity: <span className="text-foreground">Milestone 2 Funded</span></span>
                            <span className="text-muted-foreground">2 days ago</span>
                        </div >
                    </div >
                ))}
            </div >
        </DashboardLayout >
    )
}
