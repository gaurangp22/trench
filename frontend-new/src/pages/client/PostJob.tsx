import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/Button"
import { motion, AnimatePresence } from "framer-motion"
import {
    ArrowLeft, ArrowRight, Loader2, CheckCircle2,
    Clock, Wallet, Code, Palette, Megaphone, Shield, FileSearch,
    Server, Sparkles
} from "lucide-react"
import { useWallet } from "@solana/wallet-adapter-react"
import { EscrowService } from "@/services/escrow"
import { JobAPI, type CreateJobRequest } from "@/lib/api"
import { cn } from "@/lib/utils"

const CATEGORIES = [
    { id: "smart-contracts", label: "Smart Contracts", icon: Code, description: "Solana programs, Rust" },
    { id: "frontend", label: "Frontend", icon: Palette, description: "React, UI/UX" },
    { id: "backend", label: "Backend", icon: Server, description: "APIs, Infrastructure" },
    { id: "design", label: "Design", icon: Sparkles, description: "Brand, Graphics" },
    { id: "marketing", label: "Marketing", icon: Megaphone, description: "Growth, Community" },
    { id: "audit", label: "Audit", icon: FileSearch, description: "Security review" },
]

const STEPS = ["Details", "Description", "Budget"]

export function PostJob() {
    const navigate = useNavigate()
    const { publicKey, signTransaction, sendTransaction } = useWallet()
    const [step, setStep] = useState(1)
    const [isFunding, setIsFunding] = useState(false)
    const [txSignature, setTxSignature] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        title: "",
        category: "",
        skills: [] as string[],
        description: "",
        budgetType: "fixed",
        budget: "",
        difficulty: "intermediate"
    })

    const nextStep = () => setStep(s => Math.min(s + 1, 3))
    const prevStep = () => setStep(s => Math.max(s - 1, 1))

    const TEST_MODE = true

    const handlePostJob = async () => {
        const amount = parseFloat(formData.budget)
        if (isNaN(amount) || amount <= 0) {
            alert("Please enter a valid budget amount")
            return
        }

        setIsFunding(true)
        try {
            let signature = "TEST_MODE_NO_SIGNATURE"

            if (!TEST_MODE) {
                if (!publicKey) {
                    alert("Please connect your wallet first!")
                    setIsFunding(false)
                    return
                }
                const escrowService = new EscrowService()
                signature = await escrowService.fundJob(
                    { publicKey, signTransaction, sendTransaction },
                    "temp-id",
                    amount
                )
            } else {
                await new Promise(resolve => setTimeout(resolve, 1000))
            }

            const jobData: CreateJobRequest = {
                title: formData.title,
                description: formData.description,
                budget: amount,
                budget_type: formData.budgetType as 'fixed' | 'hourly',
                difficulty: formData.difficulty,
                skills: formData.skills,
            }

            await JobAPI.create(jobData)
            setTxSignature(signature)
        } catch (error) {
            console.error("Failed to post job:", error)
            alert("Failed to post job. Please try again.")
        } finally {
            setIsFunding(false)
        }
    }

    // Success State
    if (txSignature) {
        return (
            <DashboardLayout role="client">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-lg mx-auto text-center pt-16"
                >
                    <div className="relative w-20 h-20 mx-auto mb-6">
                        <div className="absolute inset-0 bg-indigo-500/30 rounded-full blur-xl animate-pulse" />
                        <div className="relative w-full h-full bg-indigo-500/10 rounded-full border border-indigo-500/30 flex items-center justify-center">
                            <CheckCircle2 className="w-10 h-10 text-indigo-400" />
                        </div>
                    </div>

                    <h2 className="text-3xl font-bold text-white mb-3">Job Posted!</h2>
                    <p className="text-zinc-400 mb-8">
                        Your job is now live and visible to freelancers
                    </p>

                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 mb-8 text-left">
                        <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Budget</p>
                        <p className="text-2xl font-bold text-white">◎ {formData.budget} SOL</p>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={() => navigate('/client/dashboard')}
                            className="flex-1 h-12 rounded-xl border-white/10 text-white hover:bg-white/5"
                        >
                            Dashboard
                        </Button>
                        <Button
                            onClick={() => navigate('/client/jobs')}
                            className="flex-1 h-12 rounded-xl bg-white text-black hover:bg-zinc-100 font-semibold"
                        >
                            View Jobs
                        </Button>
                    </div>
                </motion.div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout role="client">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <button
                        onClick={() => navigate('/client/dashboard')}
                        className="inline-flex items-center text-sm text-zinc-500 hover:text-white transition-colors mb-6"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </button>

                    <h1 className="text-3xl font-bold text-white mb-2">Create a job</h1>
                    <p className="text-zinc-400">Find the perfect web3 talent for your project</p>
                </motion.div>

                {/* Progress Steps */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="flex items-center justify-between mb-8"
                >
                    {STEPS.map((label, i) => {
                        const stepNum = i + 1
                        const isActive = step === stepNum
                        const isComplete = step > stepNum

                        return (
                            <div key={label} className="flex items-center">
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all",
                                        isComplete ? "bg-indigo-500 text-white" :
                                        isActive ? "bg-white text-black" :
                                        "bg-white/[0.06] text-zinc-500"
                                    )}>
                                        {isComplete ? <CheckCircle2 className="w-4 h-4" /> : stepNum}
                                    </div>
                                    <span className={cn(
                                        "text-sm font-medium hidden sm:block",
                                        isActive ? "text-white" : "text-zinc-500"
                                    )}>
                                        {label}
                                    </span>
                                </div>
                                {i < STEPS.length - 1 && (
                                    <div className={cn(
                                        "w-12 sm:w-24 h-px mx-4",
                                        step > stepNum ? "bg-indigo-500" : "bg-white/[0.08]"
                                    )} />
                                )}
                            </div>
                        )
                    })}
                </motion.div>

                {/* Form Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="relative rounded-2xl bg-white/[0.02] border border-white/[0.06] p-6 sm:p-8 mb-6"
                >
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-3">
                                        Job title
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Senior Rust Developer for DeFi Protocol"
                                        className="w-full h-12 px-4 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10 transition-all"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-3">
                                        Category
                                    </label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {CATEGORIES.map((cat) => {
                                            const Icon = cat.icon
                                            const isSelected = formData.category === cat.id

                                            return (
                                                <button
                                                    key={cat.id}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, category: cat.id })}
                                                    className={cn(
                                                        "relative p-4 rounded-xl border text-left transition-all group",
                                                        isSelected
                                                            ? "bg-white/[0.06] border-white/20"
                                                            : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.1]"
                                                    )}
                                                >
                                                    <Icon className={cn(
                                                        "w-5 h-5 mb-2 transition-colors",
                                                        isSelected ? "text-white" : "text-zinc-500 group-hover:text-zinc-400"
                                                    )} />
                                                    <div className={cn(
                                                        "text-sm font-medium transition-colors",
                                                        isSelected ? "text-white" : "text-zinc-400"
                                                    )}>
                                                        {cat.label}
                                                    </div>
                                                    <div className="text-xs text-zinc-600 mt-0.5">{cat.description}</div>

                                                    {isSelected && (
                                                        <div className="absolute top-2 right-2">
                                                            <div className="w-2 h-2 rounded-full bg-indigo-400" />
                                                        </div>
                                                    )}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-3">
                                        Job description
                                    </label>
                                    <textarea
                                        placeholder="Describe the project scope, requirements, and what you're looking for in a candidate..."
                                        className="w-full min-h-[300px] px-4 py-4 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10 transition-all resize-none leading-relaxed"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                    <p className="text-xs text-zinc-500 mt-2">
                                        Tip: Be specific about deliverables, timeline, and any technical requirements
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-3">
                                        Payment type
                                    </label>
                                    <div className="grid sm:grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, budgetType: 'fixed' })}
                                            className={cn(
                                                "relative p-5 rounded-xl border text-left transition-all",
                                                formData.budgetType === 'fixed'
                                                    ? "bg-white/[0.06] border-white/20"
                                                    : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]"
                                            )}
                                        >
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-lg flex items-center justify-center",
                                                    formData.budgetType === 'fixed' ? "bg-indigo-500/20" : "bg-white/[0.06]"
                                                )}>
                                                    <Wallet className={cn(
                                                        "w-5 h-5",
                                                        formData.budgetType === 'fixed' ? "text-indigo-400" : "text-zinc-500"
                                                    )} />
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-white">Fixed Price</div>
                                                    <div className="text-xs text-zinc-500">Set project budget</div>
                                                </div>
                                            </div>
                                            {formData.budgetType === 'fixed' && (
                                                <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-indigo-400" />
                                            )}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, budgetType: 'hourly' })}
                                            className={cn(
                                                "relative p-5 rounded-xl border text-left transition-all",
                                                formData.budgetType === 'hourly'
                                                    ? "bg-white/[0.06] border-white/20"
                                                    : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]"
                                            )}
                                        >
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-lg flex items-center justify-center",
                                                    formData.budgetType === 'hourly' ? "bg-indigo-500/20" : "bg-white/[0.06]"
                                                )}>
                                                    <Clock className={cn(
                                                        "w-5 h-5",
                                                        formData.budgetType === 'hourly' ? "text-indigo-400" : "text-zinc-500"
                                                    )} />
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-white">Hourly Rate</div>
                                                    <div className="text-xs text-zinc-500">Pay per hour worked</div>
                                                </div>
                                            </div>
                                            {formData.budgetType === 'hourly' && (
                                                <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-indigo-400" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-3">
                                        {formData.budgetType === 'fixed' ? 'Budget' : 'Hourly rate'} (SOL)
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-medium">◎</span>
                                        <input
                                            type="number"
                                            placeholder="0.00"
                                            className="w-full h-14 pl-10 pr-4 bg-white/[0.03] border border-white/[0.08] rounded-xl text-xl font-semibold text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10 transition-all"
                                            value={formData.budget}
                                            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                    <Shield className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                                    <div className="text-sm">
                                        <p className="font-medium text-amber-300 mb-1">Escrow Protection</p>
                                        <p className="text-amber-200/70 leading-relaxed">
                                            Funds are held securely on-chain and only released when you approve the completed work.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="flex items-center justify-between"
                >
                    <Button
                        variant="ghost"
                        onClick={prevStep}
                        disabled={step === 1}
                        className="text-zinc-400 hover:text-white disabled:opacity-0"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>

                    <Button
                        onClick={step === 3 ? handlePostJob : nextStep}
                        disabled={isFunding || (step === 1 && !formData.title) || (step === 2 && !formData.description) || (step === 3 && !formData.budget)}
                        className="h-12 px-6 rounded-xl bg-white text-black hover:bg-zinc-100 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isFunding ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Creating...
                            </>
                        ) : step === 3 ? (
                            <>
                                Post Job
                                <CheckCircle2 className="w-4 h-4 ml-2" />
                            </>
                        ) : (
                            <>
                                Continue
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </>
                        )}
                    </Button>
                </motion.div>
            </div>
        </DashboardLayout>
    )
}
