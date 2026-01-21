import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/button"
import { PlusCircle, MoreVertical, Eye, Coins, Loader2, Search, Briefcase } from "lucide-react"
import { useWallet } from "@solana/wallet-adapter-react"
import { EscrowService } from "@/services/escrow"
import { PublicKey } from "@solana/web3.js"
import { JobAPI, type Job } from "@/lib/api"
import { cn } from "@/lib/utils"

export function ManageJobs() {
    const { publicKey, signTransaction, sendTransaction } = useWallet()
    // Changed to string to handle UUIDs
    const [releasingJobId, setReleasingJobId] = useState<string | null>(null)
    const [jobs, setJobs] = useState<Job[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [filter, setFilter] = useState<'all' | 'active' | 'drafts' | 'closed'>('all')

    useEffect(() => {
        loadJobs()
    }, [])

    const loadJobs = async () => {
        try {
            const data = await JobAPI.getMyJobs()
            setJobs(data)
        } catch (error) {
            console.error("Failed to load jobs", error)
        } finally {
            setIsLoading(false)
        }
    }


    const handleReleasePayment = async (jobId: string, amountStr: string | number) => {
        if (!publicKey) {
            alert("Connect wallet first")
            return
        }

        // Parse amount "450 SOL" -> 450
        const amount = typeof amountStr === 'string' ? parseFloat(amountStr.split(' ')[0]) : amountStr
        if (isNaN(amount)) return

        setReleasingJobId(jobId)
        try {
            const escrowService = new EscrowService()

            // Real implementation would fetch the actual escrow account address from backend/contract state
            // For now using dummy address as placeholder
            const signature = await escrowService.releasePayment(
                { publicKey, signTransaction, sendTransaction },
                new PublicKey("Escrow...Account...Key"), // dummy escrow account
                publicKey, // payment back to self for demo, or to freelancer
                amount / 2 // release 50% for now
            )

            console.log("Payment Released:", signature)
            alert(`Successfully released payment! TX: ${signature.slice(0, 8)}...`)

        } catch (error) {
            console.error(error)
            alert("Failed to release payment")
        } finally {
            setReleasingJobId(null)
        }
    }

    const filteredJobs = jobs.filter(job => {
        if (filter === 'all') return true;
        return job.status === filter;
    });

    return (
        <DashboardLayout role="client">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 animate-fade-in-up">
                <div>
                    <h1 className="text-4xl font-heading font-bold text-white mb-2 tracking-tight">My Jobs</h1>
                    <p className="text-zinc-400 text-lg">Manage your job postings and review proposals.</p>
                </div>
                <Button
                    className="h-12 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90 font-bold transition-all hover:scale-105 shadow-[0_0_20px_rgba(99,102,241,0.3)]"
                    onClick={() => window.location.href = '/client/post-job'}
                >
                    <PlusCircle className="w-5 h-5 mr-2" />
                    Post New Job
                </Button>
            </div>

            {/* Controls Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
                {/* Filters */}
                <div className="flex items-center gap-1 bg-[#0a0a0c] p-1.5 rounded-xl border border-white/5 w-full md:w-fit overflow-x-auto">
                    {(['all', 'active', 'drafts', 'closed'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={cn(
                                "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 capitalize whitespace-nowrap",
                                filter === f ? "bg-white/10 text-white shadow-sm" : "text-zinc-500 hover:text-white hover:bg-white/5"
                            )}
                        >
                            {f} {f !== 'all' && <span className="ml-1.5 opacity-60 text-xs text-zinc-400">({jobs.filter(j => j.status === f).length})</span>}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                        type="text"
                        placeholder="Search your jobs..."
                        className="w-full h-11 bg-[#0a0a0c] border border-white/10 rounded-xl pl-10 pr-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
                    />
                </div>
            </div>

            {/* Jobs List */}
            <div className="space-y-4">
                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                    </div>
                ) : filteredJobs.length === 0 ? (
                    <div className="text-center py-24 bg-[#0a0a0c] border border-white/5 rounded-3xl flex flex-col items-center justify-center">
                        <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-6">
                            <Briefcase className="w-10 h-10 text-zinc-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">No jobs found</h3>
                        <p className="text-zinc-500 mb-8 max-w-sm">
                            {filter === 'all'
                                ? "You haven't posted any jobs yet. Create your first listing to start hiring!"
                                : `You don't have any ${filter} jobs at the moment.`}
                        </p>
                        {filter === 'all' && (
                            <Button
                                className="h-11 px-8 rounded-xl bg-white text-black hover:bg-zinc-200 font-bold transition-all hover:scale-105"
                                onClick={() => window.location.href = '/client/post-job'}
                            >
                                Create Job Posting
                            </Button>
                        )}
                    </div>
                ) : (
                    filteredJobs.map((job, i) => (
                        <div
                            key={job.id}
                            className="group bg-[#0a0a0c] border border-white/5 rounded-2xl p-6 transition-all duration-300 hover:border-indigo-500/30 hover:shadow-[0_0_30px_rgba(99,102,241,0.05)] hover:-translate-y-1 relative"
                            style={{ animationDelay: `${i * 0.05}s` }}
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors tracking-tight">
                                            {job.title}
                                        </h3>
                                        <span className={cn(
                                            "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                                            job.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                job.status === 'open' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                    'bg-zinc-500/10 text-zinc-400 border-white/5'
                                        )}>
                                            {job.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm">
                                        <span className="text-zinc-400 font-medium">
                                            {job.budget_type === 'fixed' ? 'Fixed Price' : 'Hourly'} <span className="text-zinc-600 mx-1">•</span> <span className="text-white font-bold">◎ {job.budget}</span>
                                        </span>
                                        <span className="text-zinc-600">•</span>
                                        <span className="text-zinc-500">Posted {new Date(job.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="flex flex-col items-center px-6 border-r border-white/5 min-w-[100px]">
                                        <div className="text-2xl font-heading font-bold text-white group-hover:text-indigo-400 transition-colors">
                                            {job.proposal_count || 0}
                                        </div>
                                        <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Proposals</div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {job.status === 'active' && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleReleasePayment(job.id, job.budget)}
                                                disabled={releasingJobId === job.id}
                                                className="border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 h-10 px-4 rounded-xl"
                                            >
                                                {releasingJobId === job.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Coins className="w-4 h-4 mr-2" />}
                                                Release Pay
                                            </Button>
                                        )}
                                        <Button size="sm" variant="outline" className="border-white/10 text-zinc-300 hover:text-white hover:bg-white/5 h-10 px-4 rounded-xl">
                                            <Eye className="w-4 h-4 mr-2" />
                                            View Proposals
                                        </Button>
                                        <Button size="icon" variant="ghost" className="text-zinc-500 hover:text-white h-10 w-10 hover:bg-white/5 rounded-xl">
                                            <MoreVertical className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )))}
            </div>
        </DashboardLayout>
    )
}
