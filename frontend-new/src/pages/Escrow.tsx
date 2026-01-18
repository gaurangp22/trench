import { useState } from "react"
import { Shield, CheckCircle, Clock, HelpCircle, ExternalLink } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Mock escrow data - in production, fetch from blockchain
const MOCK_ESCROWS = [
    {
        id: "ESC-001",
        contractId: "7xKL...9a2E",
        jobTitle: "Senior Smart Contract Engineer",
        client: {
            name: "DeFi Protocol X",
            address: "8xMN...3b4F",
            avatar: "D"
        },
        freelancer: {
            name: "Alex Developer",
            address: "9yNO...4c5G",
            avatar: "A"
        },
        amount: 150,
        status: "in_progress" as EscrowStatus,
        createdAt: "2024-01-15",
        milestones: [
            { name: "Initial Setup", amount: 30, status: "released" },
            { name: "Core Development", amount: 70, status: "in_escrow" },
            { name: "Testing & Deployment", amount: 50, status: "pending" },
        ]
    },
    {
        id: "ESC-002",
        contractId: "3aBC...5d6E",
        jobTitle: "Frontend UI Development",
        client: {
            name: "NFT Marketplace",
            address: "2bCD...7e8F",
            avatar: "N"
        },
        freelancer: {
            name: "Alex Developer",
            address: "9yNO...4c5G",
            avatar: "A"
        },
        amount: 80,
        status: "funded" as EscrowStatus,
        createdAt: "2024-01-18",
        milestones: [
            { name: "UI Components", amount: 40, status: "in_escrow" },
            { name: "Integration", amount: 40, status: "pending" },
        ]
    }
]

type EscrowStatus = "funded" | "in_progress" | "submitted" | "approved" | "released" | "disputed"

const STATUS_STEPS: { key: EscrowStatus; label: string; description: string }[] = [
    { key: "funded", label: "Funded", description: "Client has deposited funds into escrow" },
    { key: "in_progress", label: "In Progress", description: "Freelancer is working on the project" },
    { key: "submitted", label: "Submitted", description: "Work has been submitted for review" },
    { key: "approved", label: "Approved", description: "Client has approved the work" },
    { key: "released", label: "Released", description: "Payment has been released to freelancer" },
]

export function Escrow() {
    const [selectedEscrow, setSelectedEscrow] = useState(MOCK_ESCROWS[0])
    const [showTooltip, setShowTooltip] = useState<string | null>(null)

    const getStatusIndex = (status: EscrowStatus) => {
        return STATUS_STEPS.findIndex(s => s.key === status)
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-20">
            <div className="container max-w-6xl mx-auto px-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-semibold text-white mb-2">
                        Escrow Dashboard
                    </h1>
                    <p className="text-zinc-400">
                        Track your secured payments and contract status on-chain.
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Escrow List */}
                    <div className="lg:col-span-1 space-y-4">
                        <h2 className="text-sm font-medium text-zinc-400 mb-3">Your Contracts</h2>
                        {MOCK_ESCROWS.map((escrow) => (
                            <button
                                key={escrow.id}
                                onClick={() => setSelectedEscrow(escrow)}
                                className={cn(
                                    "w-full text-left p-4 rounded-xl border transition-all",
                                    selectedEscrow.id === escrow.id
                                        ? "bg-zinc-900 border-purple-500/50"
                                        : "bg-zinc-900/30 border-zinc-800 hover:border-zinc-700"
                                )}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <span className="text-xs text-zinc-500 font-mono">{escrow.id}</span>
                                    <StatusBadge status={escrow.status} />
                                </div>
                                <h3 className="text-sm font-medium text-white mb-1">{escrow.jobTitle}</h3>
                                <div className="text-lg font-semibold text-white">
                                    ◎ {escrow.amount} <span className="text-sm text-zinc-500">SOL</span>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Escrow Detail */}
                    <div className="lg:col-span-2">
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                            {/* Contract Header */}
                            <div className="flex items-start justify-between mb-8">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Shield className="w-5 h-5 text-purple-400" />
                                        <span className="text-sm text-zinc-400">Escrow Contract</span>
                                    </div>
                                    <h2 className="text-xl font-semibold text-white mb-1">
                                        {selectedEscrow.jobTitle}
                                    </h2>
                                    <span className="text-xs text-zinc-500 font-mono">
                                        ID: {selectedEscrow.contractId}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-white">
                                        ◎ {selectedEscrow.amount}
                                    </div>
                                    <div className="text-sm text-zinc-500">SOL</div>
                                </div>
                            </div>

                            {/* Parties */}
                            <div className="grid md:grid-cols-2 gap-4 mb-8">
                                <div className="p-4 bg-zinc-800/50 rounded-lg">
                                    <div className="text-xs text-zinc-500 mb-2">Client</div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                                            {selectedEscrow.client.avatar}
                                        </div>
                                        <div>
                                            <div className="font-medium text-white">{selectedEscrow.client.name}</div>
                                            <div className="text-xs text-zinc-500 font-mono">{selectedEscrow.client.address}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 bg-zinc-800/50 rounded-lg">
                                    <div className="text-xs text-zinc-500 mb-2">Freelancer</div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                                            {selectedEscrow.freelancer.avatar}
                                        </div>
                                        <div>
                                            <div className="font-medium text-white">{selectedEscrow.freelancer.name}</div>
                                            <div className="text-xs text-zinc-500 font-mono">{selectedEscrow.freelancer.address}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Status Timeline */}
                            <div className="mb-8">
                                <h3 className="text-sm font-medium text-zinc-400 mb-4">Status Timeline</h3>
                                <div className="relative">
                                    {/* Progress Bar Background */}
                                    <div className="absolute top-5 left-0 right-0 h-1 bg-zinc-800 rounded-full" />

                                    {/* Animated Progress Bar */}
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{
                                            width: `${(getStatusIndex(selectedEscrow.status) / (STATUS_STEPS.length - 1)) * 100}%`
                                        }}
                                        transition={{ duration: 0.8, ease: "easeOut" }}
                                        className="absolute top-5 left-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                                    />

                                    {/* Steps */}
                                    <div className="relative flex justify-between">
                                        {STATUS_STEPS.map((step, index) => {
                                            const currentIndex = getStatusIndex(selectedEscrow.status)
                                            const isCompleted = index <= currentIndex
                                            const isCurrent = index === currentIndex

                                            return (
                                                <div
                                                    key={step.key}
                                                    className="flex flex-col items-center relative"
                                                    onMouseEnter={() => setShowTooltip(step.key)}
                                                    onMouseLeave={() => setShowTooltip(null)}
                                                >
                                                    {/* Step Circle */}
                                                    <motion.div
                                                        initial={{ scale: 0.8 }}
                                                        animate={{
                                                            scale: isCurrent ? 1.1 : 1,
                                                            backgroundColor: isCompleted ? "#a855f7" : "#27272a"
                                                        }}
                                                        transition={{ duration: 0.3 }}
                                                        className={cn(
                                                            "w-10 h-10 rounded-full flex items-center justify-center border-2 z-10",
                                                            isCompleted
                                                                ? "border-purple-500 bg-purple-500"
                                                                : "border-zinc-700 bg-zinc-800",
                                                            isCurrent && "ring-4 ring-purple-500/30"
                                                        )}
                                                    >
                                                        {isCompleted ? (
                                                            <CheckCircle className="w-5 h-5 text-white" />
                                                        ) : (
                                                            <Clock className="w-5 h-5 text-zinc-500" />
                                                        )}
                                                    </motion.div>

                                                    {/* Label */}
                                                    <span className={cn(
                                                        "text-xs mt-2 text-center max-w-[80px]",
                                                        isCompleted ? "text-white font-medium" : "text-zinc-500"
                                                    )}>
                                                        {step.label}
                                                    </span>

                                                    {/* Tooltip */}
                                                    {showTooltip === step.key && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            className="absolute top-full mt-8 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-zinc-300 whitespace-nowrap z-20"
                                                        >
                                                            {step.description}
                                                        </motion.div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* What Happens Next */}
                            <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg mb-6">
                                <div className="flex items-start gap-3">
                                    <HelpCircle className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="text-sm font-medium text-purple-400 mb-1">What happens next?</h4>
                                        <p className="text-sm text-zinc-400">
                                            {selectedEscrow.status === "funded" && "The freelancer is now beginning work on your project. You'll receive updates as milestones are completed."}
                                            {selectedEscrow.status === "in_progress" && "Work is underway. Once a milestone is submitted, you'll be able to review and approve it."}
                                            {selectedEscrow.status === "submitted" && "The freelancer has submitted work for review. Check it out and approve to release payment."}
                                            {selectedEscrow.status === "approved" && "Payment is being processed and will be released to the freelancer shortly."}
                                            {selectedEscrow.status === "released" && "This contract is complete! Funds have been transferred to the freelancer."}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Milestones */}
                            {selectedEscrow.milestones && (
                                <div>
                                    <h3 className="text-sm font-medium text-zinc-400 mb-3">Milestones</h3>
                                    <div className="space-y-3">
                                        {selectedEscrow.milestones.map((milestone, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "w-2 h-2 rounded-full",
                                                        milestone.status === "released" && "bg-emerald-500",
                                                        milestone.status === "in_escrow" && "bg-amber-500",
                                                        milestone.status === "pending" && "bg-zinc-600"
                                                    )} />
                                                    <span className="text-sm text-white">{milestone.name}</span>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-sm font-medium text-white">
                                                        ◎ {milestone.amount}
                                                    </span>
                                                    <span className={cn(
                                                        "text-xs px-2 py-1 rounded",
                                                        milestone.status === "released" && "bg-emerald-500/10 text-emerald-400",
                                                        milestone.status === "in_escrow" && "bg-amber-500/10 text-amber-400",
                                                        milestone.status === "pending" && "bg-zinc-800 text-zinc-500"
                                                    )}>
                                                        {milestone.status === "released" && "Released"}
                                                        {milestone.status === "in_escrow" && "In Escrow"}
                                                        {milestone.status === "pending" && "Pending"}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3 mt-6 pt-6 border-t border-zinc-800">
                                <Button
                                    variant="outline"
                                    className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                                >
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    View on Explorer
                                </Button>
                                <Button
                                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                                >
                                    {selectedEscrow.status === "submitted" ? "Review & Approve" : "View Contract"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Status Badge Component
function StatusBadge({ status }: { status: EscrowStatus }) {
    const config = {
        funded: { bg: "bg-blue-500/10", text: "text-blue-400", label: "Funded" },
        in_progress: { bg: "bg-amber-500/10", text: "text-amber-400", label: "In Progress" },
        submitted: { bg: "bg-purple-500/10", text: "text-purple-400", label: "Submitted" },
        approved: { bg: "bg-emerald-500/10", text: "text-emerald-400", label: "Approved" },
        released: { bg: "bg-emerald-500/10", text: "text-emerald-400", label: "Released" },
        disputed: { bg: "bg-red-500/10", text: "text-red-400", label: "Disputed" },
    }

    const { bg, text, label } = config[status]

    return (
        <span className={cn("px-2 py-0.5 rounded text-xs font-medium", bg, text)}>
            {label}
        </span>
    )
}
