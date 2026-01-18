import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/button"
import { MessageSquare, ExternalLink, Clock, CheckCircle } from "lucide-react"

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
        startDate: "Jan 10, 2026"
    },
    {
        id: 2,
        title: "Solana Smart Contract Integration",
        client: "Helium Foundation",
        rate: "Fixed Price",
        amount: "500 SOL",
        paid: "250 SOL",
        remaining: "250 SOL",
        status: "Active",
        startDate: "Jan 15, 2026"
    }
]

export function ActiveContracts() {
    return (
        <DashboardLayout role="freelancer">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white">Active Contracts</h1>
                <p className="text-zinc-400 mt-1">Manage your current work and submit milestones.</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {MOCK_CONTRACTS.map((contract) => (
                    <div
                        key={contract.id}
                        className="bg-zinc-900/30 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-colors"
                    >
                        <div className="p-6">
                            <div className="flex flex-col md:flex-row justify-between gap-6 mb-6">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-xl font-bold text-white">{contract.title}</h3>
                                        <span className="bg-green-500/10 text-green-400 text-xs font-medium px-2 py-0.5 rounded uppercase tracking-wider">
                                            {contract.status}
                                        </span>
                                    </div>
                                    <p className="text-zinc-400">Client: <span className="text-zinc-300">{contract.client}</span> • Started {contract.startDate}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800">
                                        <MessageSquare className="w-4 h-4 mr-2" />
                                        Message
                                    </Button>
                                    <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                                        <ExternalLink className="w-4 h-4 mr-2" />
                                        Open Workroom
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-zinc-900/50 rounded-lg border border-zinc-800/50">
                                {contract.rate.includes('/hr') ? (
                                    <>
                                        <div>
                                            <div className="text-xs text-zinc-500 uppercase tracking-wider font-medium mb-1">Rate</div>
                                            <div className="text-white font-semibold">{contract.rate}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-zinc-500 uppercase tracking-wider font-medium mb-1">Hours This Week</div>
                                            <div className="text-white font-semibold flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-purple-400" />
                                                {contract.hoursLogged}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-zinc-500 uppercase tracking-wider font-medium mb-1">Total Earned</div>
                                            <div className="text-white font-semibold text-green-400">{contract.totalEarned}</div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div>
                                            <div className="text-xs text-zinc-500 uppercase tracking-wider font-medium mb-1">Total Budget</div>
                                            <div className="text-white font-semibold">{contract.amount}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-zinc-500 uppercase tracking-wider font-medium mb-1">Paid</div>
                                            <div className="text-white font-semibold text-green-400 flex items-center gap-2">
                                                <CheckCircle className="w-4 h-4" />
                                                {contract.paid}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-zinc-500 uppercase tracking-wider font-medium mb-1">Remaining</div>
                                            <div className="text-white font-semibold text-zinc-400">{contract.remaining}</div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Recent Activity Mini-feed */}
                        <div className="bg-zinc-950/30 px-6 py-3 border-t border-zinc-800 flex items-center justify-between text-sm">
                            <span className="text-zinc-500">Last activity: <span className="text-zinc-300">Milestone 2 Funded</span></span>
                            <span className="text-zinc-600">2 days ago</span>
                        </div>
                    </div>
                ))}
            </div>
        </DashboardLayout>
    )
}
