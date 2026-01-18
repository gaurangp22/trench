import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/button"
import { PlusCircle, MoreVertical, Eye, Coins, Loader2 } from "lucide-react"
import { useWallet } from "@solana/wallet-adapter-react"
import { EscrowService } from "@/services/escrow"
import { PublicKey } from "@solana/web3.js"
import { JobAPI, type Job } from "@/lib/api"

export function ManageJobs() {
    const { publicKey, signTransaction, sendTransaction } = useWallet()
    // Changed to string to handle UUIDs
    const [releasingJobId, setReleasingJobId] = useState<string | null>(null)
    const [jobs, setJobs] = useState<Job[]>([])
    const [isLoading, setIsLoading] = useState(true)

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
            const recipient = new PublicKey("7Xw76w...mock...recipient") // Mock recipient
            const escrowAccount = new PublicKey("Escrow...Account...Key") // Mock escrow account

            const signature = await escrowService.releasePayment(
                { publicKey, signTransaction, sendTransaction },
                escrowAccount, // dummy
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

    return (
        <DashboardLayout role="client">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">My Jobs</h1>
                    <p className="text-zinc-400 mt-1">Manage your job postings and view proposals.</p>
                </div>
                <Button
                    className="bg-white text-black hover:bg-zinc-200"
                    onClick={() => window.location.href = '/client/post-job'}
                >
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Post New Job
                </Button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 mb-6 bg-zinc-900/50 p-2 rounded-xl border border-zinc-800 w-full md:w-fit">
                <Button variant="ghost" className="text-white bg-zinc-800 h-8 text-xs">All Jobs</Button>
                <Button variant="ghost" className="text-zinc-400 hover:text-white h-8 text-xs">Active (2)</Button>
                <Button variant="ghost" className="text-zinc-400 hover:text-white h-8 text-xs">Drafts (1)</Button>
                <Button variant="ghost" className="text-zinc-400 hover:text-white h-8 text-xs">Closed</Button>
            </div>

            {/* Jobs List */}
            <div className="space-y-4">
                {isLoading ? (
                    <div className="text-center py-10 text-zinc-500">Loading jobs...</div>
                ) : jobs.length === 0 ? (
                    <div className="text-center py-10 text-zinc-500 bg-zinc-900/20 rounded-xl border border-dashed border-zinc-800">
                        No jobs posted yet. Create your first listing!
                    </div>
                ) : (
                    jobs.map((job) => (
                        <div
                            key={job.id}
                            className="group bg-zinc-900/30 border border-zinc-800 rounded-xl p-6 transition-all hover:bg-zinc-900/50 hover:border-zinc-700"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-semibold text-white group-hover:text-purple-400 transition-colors">
                                            {job.title}
                                        </h3>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider ${job.status === 'active' ? 'bg-green-500/10 text-green-400' :
                                            job.status === 'open' ? 'bg-blue-500/10 text-blue-400' :
                                                'bg-zinc-500/10 text-zinc-400'
                                            }`}>
                                            {job.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-zinc-500">
                                        <span>{job.budget_type === 'fixed' ? 'Fixed Price' : 'Hourly'} - {job.budget} SOL</span>
                                        <span>•</span>
                                        <span>Posted {new Date(job.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="text-center px-4 border-r border-zinc-800">
                                        <div className="text-xl font-bold text-white">{job.proposal_count || 0}</div>
                                        <div className="text-xs text-zinc-500">Proposals</div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {job.status === 'active' && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleReleasePayment(job.id, job.budget)}
                                                disabled={releasingJobId === job.id}
                                                className="border-green-500/20 text-green-400 hover:bg-green-500/10 h-9"
                                            >
                                                {releasingJobId === job.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Coins className="w-4 h-4 mr-2" />}
                                                Release Pay
                                            </Button>
                                        )}
                                        <Button size="sm" variant="outline" className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 h-9">
                                            <Eye className="w-4 h-4 mr-2" />
                                            View Proposals
                                        </Button>
                                        <Button size="icon" variant="ghost" className="text-zinc-500 hover:text-white h-9 w-9">
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
