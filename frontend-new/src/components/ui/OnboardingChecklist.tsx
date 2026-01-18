import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Check, ChevronRight, Wallet, User, FileText, Shield, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface ChecklistStep {
    id: string
    title: string
    description: string
    icon: any
    href?: string
    action?: string
    isComplete: boolean
}

interface OnboardingChecklistProps {
    userRole: "client" | "freelancer"
    onDismiss?: () => void
    className?: string
}

const FREELANCER_STEPS: ChecklistStep[] = [
    {
        id: "wallet",
        title: "Connect your wallet",
        description: "Link your Solana wallet to receive payments",
        icon: Wallet,
        action: "Connect",
        isComplete: false
    },
    {
        id: "profile",
        title: "Complete your profile",
        description: "Add skills, bio, and portfolio to stand out",
        icon: User,
        href: "/freelancer/profile",
        isComplete: false
    },
    {
        id: "proposal",
        title: "Submit your first proposal",
        description: "Find a job and send a proposal",
        icon: FileText,
        href: "/jobs",
        isComplete: false
    },
    {
        id: "escrow",
        title: "Understand escrow",
        description: "Learn how on-chain payments protect you",
        icon: Shield,
        href: "/how-it-works",
        isComplete: false
    }
]

const CLIENT_STEPS: ChecklistStep[] = [
    {
        id: "wallet",
        title: "Connect your wallet",
        description: "Link your Solana wallet to fund escrow",
        icon: Wallet,
        action: "Connect",
        isComplete: false
    },
    {
        id: "post-job",
        title: "Post your first job",
        description: "Create a job listing to attract talent",
        icon: FileText,
        href: "/client/post-job",
        isComplete: false
    },
    {
        id: "fund-escrow",
        title: "Fund escrow",
        description: "Secure funds to attract top freelancers",
        icon: Shield,
        href: "/escrow",
        isComplete: false
    },
    {
        id: "hire",
        title: "Hire a freelancer",
        description: "Review proposals and start a contract",
        icon: User,
        href: "/client/jobs",
        isComplete: false
    }
]

export function OnboardingChecklist({ userRole, onDismiss, className }: OnboardingChecklistProps) {
    const [steps, setSteps] = useState<ChecklistStep[]>(
        userRole === "client" ? CLIENT_STEPS : FREELANCER_STEPS
    )
    const [isMinimized, setIsMinimized] = useState(false)

    const completedCount = steps.filter(s => s.isComplete).length
    const progress = (completedCount / steps.length) * 100

    // Simulate checking completion status (in production, fetch from API)
    useEffect(() => {
        // Check wallet connection
        const walletConnected = localStorage.getItem("walletConnected") === "true"
        if (walletConnected) {
            setSteps(prev => prev.map(s =>
                s.id === "wallet" ? { ...s, isComplete: true } : s
            ))
        }
    }, [])

    const handleStepClick = (step: ChecklistStep) => {
        if (step.action === "Connect") {
            // Trigger wallet connection modal
            // For demo, mark as complete
            setSteps(prev => prev.map(s =>
                s.id === step.id ? { ...s, isComplete: true } : s
            ))
            localStorage.setItem("walletConnected", "true")
        }
    }

    if (completedCount === steps.length) {
        return null // Hide when all complete
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={cn(
                "bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-xl overflow-hidden",
                className
            )}
        >
            {/* Header */}
            <div
                className="p-4 flex items-center justify-between cursor-pointer"
                onClick={() => setIsMinimized(!isMinimized)}
            >
                <div>
                    <h3 className="font-medium text-white">Get Started</h3>
                    <p className="text-xs text-zinc-400">{completedCount} of {steps.length} complete</p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Progress Ring */}
                    <div className="relative w-8 h-8">
                        <svg className="w-full h-full -rotate-90">
                            <circle
                                cx="16"
                                cy="16"
                                r="14"
                                fill="none"
                                stroke="#27272a"
                                strokeWidth="3"
                            />
                            <circle
                                cx="16"
                                cy="16"
                                r="14"
                                fill="none"
                                stroke="url(#gradient)"
                                strokeWidth="3"
                                strokeDasharray={`${progress * 0.88} 88`}
                                strokeLinecap="round"
                            />
                            <defs>
                                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#a855f7" />
                                    <stop offset="100%" stopColor="#ec4899" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                    {onDismiss && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onDismiss(); }}
                            className="p-1 hover:bg-zinc-800 rounded"
                        >
                            <X className="w-4 h-4 text-zinc-500" />
                        </button>
                    )}
                </div>
            </div>

            {/* Steps */}
            <AnimatePresence>
                {!isMinimized && (
                    <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-4 space-y-2">
                            {steps.map((step, index) => (
                                <StepItem
                                    key={step.id}
                                    step={step}
                                    index={index}
                                    onClick={() => handleStepClick(step)}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

function StepItem({ step, index, onClick }: { step: ChecklistStep; index: number; onClick: () => void }) {
    const Icon = step.icon

    const content = (
        <div
            onClick={!step.href ? onClick : undefined}
            className={cn(
                "flex items-center gap-3 p-3 rounded-lg transition-colors",
                step.isComplete
                    ? "bg-zinc-800/30"
                    : "bg-zinc-800/50 hover:bg-zinc-800 cursor-pointer"
            )}
        >
            {/* Step Number/Check */}
            <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                step.isComplete
                    ? "bg-gradient-to-r from-purple-500 to-pink-500"
                    : "bg-zinc-700"
            )}>
                {step.isComplete ? (
                    <Check className="w-4 h-4 text-white" />
                ) : (
                    <span className="text-sm text-zinc-400">{index + 1}</span>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <h4 className={cn(
                    "text-sm font-medium",
                    step.isComplete ? "text-zinc-500 line-through" : "text-white"
                )}>
                    {step.title}
                </h4>
                <p className="text-xs text-zinc-500 truncate">{step.description}</p>
            </div>

            {/* Action */}
            {!step.isComplete && (
                <ChevronRight className="w-4 h-4 text-zinc-500" />
            )}
        </div>
    )

    if (step.href && !step.isComplete) {
        return <Link to={step.href}>{content}</Link>
    }

    return content
}
