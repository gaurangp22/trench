import { useState } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, ArrowRight, AlertCircle, Loader2, CheckCircle2 } from "lucide-react"
import { useWallet } from "@solana/wallet-adapter-react"
import { EscrowService } from "@/services/escrow"
import { JobAPI, type CreateJobRequest } from "@/lib/api"

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
                <div className="max-w-xl mx-auto text-center pt-20">
                    <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-10 h-10 text-green-500" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-4">Job Posted Successfully!</h2>
                    <p className="text-zinc-400 mb-8">
                        Your budget of <span className="text-white font-medium">{formData.budget} SOL</span> has been secured in the escrow contract.
                    </p>
                    <div className="bg-zinc-900 rounded-lg p-4 mb-8 break-all">
                        <p className="text-xs text-zinc-500 mb-1 uppercase tracking-wider">Transaction Signature</p>
                        <p className="text-purple-400 font-mono text-xs">{txSignature}</p>
                    </div>
                    <Button onClick={() => window.location.href = '/client/jobs'} className="bg-white text-black hover:bg-zinc-200">
                        View My Jobs
                    </Button>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout role="client">
            {/* Header */}
            <div className="mb-8">
                <Button
                    variant="ghost"
                    className="pl-0 text-zinc-400 hover:text-white mb-4"
                    onClick={() => window.history.back()}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>
                <h1 className="text-3xl font-bold text-white">Post a New Job</h1>
                <p className="text-zinc-400 mt-2">Create a job listing to find top web3 talent.</p>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-zinc-800/50 h-1.5 rounded-full mb-12 overflow-hidden">
                <div
                    className="h-full bg-purple-500 transition-all duration-500 ease-out"
                    style={{ width: `${(step / 3) * 100}%` }}
                />
            </div>

            {/* Step Content */}
            <div className="max-w-3xl">
                {step === 1 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="space-y-4">
                            <label className="text-sm font-medium text-zinc-300">Job Title</label>
                            <Input
                                placeholder="e.g. Senior Rust Developer for Solana DeFi Protocol"
                                className="bg-zinc-900/50 border-zinc-800 text-lg h-12"
                                value={formData.title}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, title: e.target.value })}
                            />
                            <p className="text-xs text-zinc-500">Be specific about the role and the technology.</p>
                        </div>

                        <div className="space-y-4">
                            <label className="text-sm font-medium text-zinc-300">Category & Skills</label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {["Smart Contracts", "Frontend", "Backend", "Design", "Marketing", "Audit"].map((cat) => (
                                    <button
                                        key={cat}
                                        className={`p-3 rounded-lg border text-sm font-medium text-left transition-all ${formData.category === cat
                                            ? "bg-white text-black border-white"
                                            : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300"
                                            }`}
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
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="space-y-4">
                            <label className="text-sm font-medium text-zinc-300">Job Description</label>
                            <textarea
                                className="w-full min-h-[300px] bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/50 resize-y"
                                placeholder="Describe the project, requirements, and what you're looking for..."
                                value={formData.description}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="space-y-6">
                            <label className="text-sm font-medium text-zinc-300">Budget & Payment</label>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    className={`p-6 rounded-xl border text-left transition-all ${formData.budgetType === 'fixed'
                                        ? "bg-zinc-800 border-purple-500 ring-1 ring-purple-500"
                                        : "bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:bg-zinc-900"
                                        }`}
                                    onClick={() => setFormData({ ...formData, budgetType: 'fixed' })}
                                >
                                    <div className="font-semibold text-white mb-1">Fixed Price</div>
                                    <div className="text-xs text-zinc-500">Pay a set amount for the project</div>
                                </button>
                                <button
                                    className={`p-6 rounded-xl border text-left transition-all ${formData.budgetType === 'hourly'
                                        ? "bg-zinc-800 border-purple-500 ring-1 ring-purple-500"
                                        : "bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:bg-zinc-900"
                                        }`}
                                    onClick={() => setFormData({ ...formData, budgetType: 'hourly' })}
                                >
                                    <div className="font-semibold text-white mb-1">Hourly Rate</div>
                                    <div className="text-xs text-zinc-500">Pay by the hour</div>
                                </button>
                            </div>

                            <div className="space-y-4">
                                <label className="text-sm text-zinc-400">
                                    {formData.budgetType === 'fixed' ? 'Total Budget (SOL)' : 'Hourly Rate (SOL/hr)'}
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">◎</span>
                                    <Input
                                        type="number"
                                        placeholder="0.00"
                                        className="pl-10 bg-zinc-900/50 border-zinc-800 text-lg h-12"
                                        value={formData.budget}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, budget: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-xl flex gap-3">
                                <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0" />
                                <div className="text-sm text-yellow-200/80">
                                    <p className="font-medium text-yellow-200 mb-1">Escrow Protection</p>
                                    When you hire, you'll need to fund the escrow contract. Funds are only released when you verify the work.
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-10 border-t border-zinc-800 mt-10">
                    <Button
                        variant="outline"
                        onClick={prevStep}
                        disabled={step === 1}
                        className="text-white border-zinc-700 hover:bg-zinc-800"
                    >
                        Back
                    </Button>
                    <Button
                        onClick={step === 3 ? handlePostJob : nextStep}
                        disabled={isFunding}
                        className="bg-white text-black hover:bg-zinc-200 min-w-[120px]"
                    >
                        {isFunding ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Funding...
                            </>
                        ) : (
                            <>
                                {step === 3 ? (formData.budget ? `Fund ${formData.budget} SOL` : "Post Job") : "Next Step"}
                                {step !== 3 && <ArrowRight className="w-4 h-4 ml-2" />}
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </DashboardLayout>
    )
}
