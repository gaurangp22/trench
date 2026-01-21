import { useState } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, ArrowRight, AlertCircle, Loader2, CheckCircle2, Clock, Wallet } from "lucide-react"
import { useWallet } from "@solana/wallet-adapter-react"
import { EscrowService } from "@/services/escrow"
import { JobAPI, type CreateJobRequest } from "@/lib/api"
import { cn } from "@/lib/utils"

export function PostJob() {
    const { publicKey, signTransaction, sendTransaction } = useWallet()
    const [step, setStep] = useState(1)
    const [isFunding, setIsFunding] = useState(false)
    const [txSignature, setTxSignature] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        title: "",
        category: "",
        skills: [] as string[],
        description: "",
        budgetType: "fixed", // 'fixed' | 'hourly'
        budget: "",
        difficulty: "intermediate"
    })

    const nextStep = () => setStep(s => Math.min(s + 1, 3))
    const prevStep = () => setStep(s => Math.max(s - 1, 1))

    const handlePostJob = async () => {
        if (!publicKey) {
            alert("Please connect your wallet first!")
            return
        }

        const amount = parseFloat(formData.budget)
        if (isNaN(amount) || amount <= 0) {
            alert("Please enter a valid budget amount")
            return
        }

        setIsFunding(true)
        try {
            // 1. Fund Escrow (On-Chain)
            const escrowService = new EscrowService()
            const signature = await escrowService.fundJob(
                { publicKey, signTransaction, sendTransaction },
                "temp-id", // Backend will generate real ID
                amount
            )
            console.log("Job funded! Signature:", signature)

            // 2. Create Job in Backend
            const jobData: CreateJobRequest = {
                title: formData.title,
                description: formData.description,
                budget: amount,
                budget_type: formData.budgetType as 'fixed' | 'hourly',
                difficulty: formData.difficulty,
                skills: formData.skills,
                // category_id: map category string to ID if needed
            }

            await JobAPI.create(jobData)

            setTxSignature(signature)
        } catch (error) {
            console.error("Failed to post job:", error)
            alert("Failed to post job. If funds were deducted, please contact support.")
        } finally {
            setIsFunding(false)
        }
    }

    if (txSignature) {
        return (
            <DashboardLayout role="client">
                <div className="max-w-xl mx-auto text-center pt-24 animate-fade-in-up">
                    <div className="relative w-24 h-24 mx-auto mb-8">
                        <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl animate-pulse" />
                        <div className="relative w-full h-full bg-emerald-500/10 rounded-full border border-emerald-500/20 flex items-center justify-center">
                            <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                        </div>
                    </div>
                    <h2 className="text-4xl font-heading font-bold text-white mb-4 tracking-tight">Job Posted Successfully!</h2>
                    <p className="text-zinc-400 text-lg mb-8 max-w-sm mx-auto leading-relaxed">
                        Your budget of <span className="text-white font-bold">◎ {formData.budget} SOL</span> has been secured in the escrow contract.
                    </p>
                    <div className="bg-[#0a0a0c] border border-white/10 rounded-xl p-5 mb-8 break-all relative overflow-hidden group hover:border-emerald-500/30 transition-colors text-left">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <p className="text-xs text-zinc-500 mb-2 uppercase tracking-wider font-semibold relative z-10">Transaction Signature</p>
                        <p className="text-emerald-400 font-mono text-sm relative z-10">{txSignature}</p>
                    </div>
                    <Button
                        onClick={() => window.location.href = '/client/jobs'}
                        className="h-12 px-8 rounded-xl bg-white text-black hover:bg-zinc-200 font-bold transition-all hover:scale-105"
                    >
                        View My Jobs
                    </Button>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout role="client">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-10 animate-fade-in-up">
                    <Button
                        variant="ghost"
                        className="pl-0 text-zinc-400 hover:text-white mb-6 hover:translate-x-[-4px] transition-transform"
                        onClick={() => window.history.back()}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Dashboard
                    </Button>
                    <h1 className="text-4xl font-heading font-bold text-white mb-3 tracking-tight">Post a New Job</h1>
                    <p className="text-zinc-400 text-lg">Create a job listing to find top web3 talent.</p>
                </div>

                {/* Progress Bar */}
                <div className="mb-12">
                    <div className="flex justify-between text-sm font-medium text-zinc-400 mb-3 px-1">
                        <span className={cn(step >= 1 ? "text-indigo-400" : "")}>Job Details</span>
                        <span className={cn(step >= 2 ? "text-indigo-400" : "")}>Description</span>
                        <span className={cn(step >= 3 ? "text-indigo-400" : "")}>Budget</span>
                    </div>
                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700 ease-in-out shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                            style={{ width: `${(step / 3) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Step Content */}
                <div className="bg-[#0a0a0c] border border-white/5 rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden min-h-[500px]">
                    <div className="relative z-10">
                        {step === 1 && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                                <div className="space-y-4">
                                    <label className="text-sm font-bold text-zinc-300 uppercase tracking-wide">Job Title</label>
                                    <Input
                                        placeholder="e.g. Senior Rust Developer for Solana DeFi Protocol"
                                        className="bg-zinc-900/50 border-white/10 text-xl h-14 px-5 rounded-xl text-white placeholder:text-zinc-600 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                                        value={formData.title}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, title: e.target.value })}
                                    />
                                    <p className="text-xs text-zinc-500 pl-1">Be specific about the role and the technology.</p>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-sm font-bold text-zinc-300 uppercase tracking-wide">Category & Skills</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {["Smart Contracts", "Frontend", "Backend", "Design", "Marketing", "Audit"].map((cat) => (
                                            <button
                                                key={cat}
                                                className={cn(
                                                    "p-4 rounded-xl border text-sm font-bold text-left transition-all duration-200",
                                                    formData.category === cat
                                                        ? "bg-indigo-500/10 border-indigo-500/50 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.1)]"
                                                        : "bg-white/5 border-white/5 text-zinc-400 hover:border-white/10 hover:text-zinc-200 hover:bg-white/10"
                                                )}
                                                onClick={() => setFormData({ ...formData, category: cat })}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                                <div className="space-y-4">
                                    <label className="text-sm font-bold text-zinc-300 uppercase tracking-wide">Job Description</label>
                                    <textarea
                                        className="w-full min-h-[400px] bg-zinc-900/50 border border-white/10 rounded-xl p-6 text-lg text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all resize-y leading-relaxed"
                                        placeholder="Describe the project, requirements, and what you're looking for..."
                                        value={formData.description}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-500">
                                <div className="space-y-6">
                                    <label className="text-sm font-bold text-zinc-300 uppercase tracking-wide">Budget & Payment</label>

                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <button
                                            className={cn(
                                                "p-6 rounded-2xl border text-left transition-all duration-200 group relative overflow-hidden",
                                                formData.budgetType === 'fixed'
                                                    ? "bg-indigo-500/10 border-indigo-500/50 ring-1 ring-indigo-500/50"
                                                    : "bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10"
                                            )}
                                            onClick={() => setFormData({ ...formData, budgetType: 'fixed' })}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <div className="flex items-center gap-3 mb-2 relative z-10">
                                                <div className={cn("p-2 rounded-lg", formData.budgetType === 'fixed' ? "bg-indigo-500 text-white" : "bg-zinc-800 text-zinc-400")}>
                                                    <Wallet className="w-5 h-5" />
                                                </div>
                                                <div className="font-bold text-white text-lg">Fixed Price</div>
                                            </div>
                                            <div className="text-sm text-zinc-400 pl-[3.25rem] relative z-10">Pay a set amount for the project completion</div>
                                        </button>
                                        <button
                                            className={cn(
                                                "p-6 rounded-2xl border text-left transition-all duration-200 group relative overflow-hidden",
                                                formData.budgetType === 'hourly'
                                                    ? "bg-indigo-500/10 border-indigo-500/50 ring-1 ring-indigo-500/50"
                                                    : "bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10"
                                            )}
                                            onClick={() => setFormData({ ...formData, budgetType: 'hourly' })}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <div className="flex items-center gap-3 mb-2 relative z-10">
                                                <div className={cn("p-2 rounded-lg", formData.budgetType === 'hourly' ? "bg-indigo-500 text-white" : "bg-zinc-800 text-zinc-400")}>
                                                    <Clock className="w-5 h-5" />
                                                </div>
                                                <div className="font-bold text-white text-lg">Hourly Rate</div>
                                            </div>
                                            <div className="text-sm text-zinc-400 pl-[3.25rem] relative z-10">Pay by the hour for ongoing work</div>
                                        </button>
                                    </div>

                                    <div className="space-y-4 pt-4">
                                        <label className="text-sm font-bold text-zinc-400">
                                            {formData.budgetType === 'fixed' ? 'Total Budget (SOL)' : 'Hourly Rate (SOL/hr)'}
                                        </label>
                                        <div className="relative group">
                                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-lg group-focus-within:text-indigo-400 transition-colors">◎</span>
                                            <Input
                                                type="number"
                                                placeholder="0.00"
                                                className="pl-12 bg-zinc-900/50 border-white/10 text-2xl h-16 rounded-xl font-bold text-white placeholder:text-zinc-700 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                                                value={formData.budget}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, budget: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="p-5 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex gap-4 mt-6">
                                        <div className="p-2 bg-amber-500/20 rounded-lg h-fit">
                                            <AlertCircle className="w-6 h-6 text-amber-500 shrink-0" />
                                        </div>
                                        <div className="text-sm text-amber-200/80">
                                            <p className="font-bold text-amber-400 mb-1 text-base">Escrow Protection</p>
                                            <p className="leading-relaxed">When you hire, you'll need to fund the escrow contract. Funds are securely held on-chain and only released when you verify and approve the work.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Background decorations for card */}
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-8 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
                    <Button
                        variant="ghost"
                        onClick={prevStep}
                        disabled={step === 1}
                        className="text-zinc-400 hover:text-white hover:bg-white/5 h-12 px-6 rounded-xl text-lg font-medium disabled:opacity-30"
                    >
                        Back
                    </Button>
                    <Button
                        onClick={step === 3 ? handlePostJob : nextStep}
                        disabled={isFunding}
                        className="h-14 px-10 rounded-xl bg-white text-black hover:bg-zinc-200 font-bold text-lg transition-all hover:scale-105 shadow-xl shadow-white/5"
                    >
                        {isFunding ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                                Funding Escrow...
                            </>
                        ) : (
                            <>
                                {step === 3 ? (formData.budget ? `Fund ${formData.budget} SOL` : "Post Job") : "Next Step"}
                                {step !== 3 && <ArrowRight className="w-5 h-5 ml-2" />}
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </DashboardLayout>
    )
}
