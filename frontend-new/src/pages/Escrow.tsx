import { useState } from "react"
import { Shield, CheckCircle, Clock, HelpCircle, ExternalLink, Wallet, ArrowUpRight } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/Button"
import { cn } from "@/lib/utils"
import { DashboardLayout } from "@/components/layout/DashboardLayout"

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
        <DashboardLayout role="freelancer">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-heading font-bold text-white tracking-tight flex items-center gap-3">
                            <Shield className="w-8 h-8 text-emerald-400" />
                            Escrow Dashboard
                        </h1>
                        <p className="text-zinc-400 mt-2">
                            Track your secured payments and contract status on-chain.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="px-4 py-2 bg-white/[0.02] border border-white/[0.06] rounded-xl">
                            <div className="text-xs text-zinc-500 mb-0.5">Total in Escrow</div>
                            <div className="text-lg font-bold text-emerald-400">◎ 230 SOL</div>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Escrow List */}
                    <div className="lg:col-span-1">
                        <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl">
                            <div className="px-6 py-4 border-b border-white/[0.06]">
                                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <Wallet className="w-5 h-5 text-emerald-400" />
                                    Your Contracts
                                </h2>
                            </div>
                            <div className="p-4 space-y-3">
                                {MOCK_ESCROWS.map((escrow) => (
                                    <button
                                        key={escrow.id}
                                        onClick={() => setSelectedEscrow(escrow)}
                                        className={cn(
                                            "w-full text-left p-4 rounded-xl border transition-all",
                                            selectedEscrow.id === escrow.id
                                                ? "bg-emerald-500/10 border-emerald-500/30"
                                                : "bg-white/[0.02] border-white/[0.06] hover:border-white/15 hover:bg-white/[0.04]"
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
                        </div>
                    </div>

                    {/* Escrow Detail */}
                    <div className="lg:col-span-2">
                        <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl">
                            {/* Contract Header */}
                            <div className="px-6 py-4 border-b border-white/[0.06]">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <Shield className="w-5 h-5 text-emerald-400" />
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
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Parties */}
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="p-4 bg-white/[0.02] rounded-xl border border-white/[0.06]">
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
                                    <div className="p-4 bg-white/[0.02] rounded-xl border border-white/[0.06]">
                                        <div className="text-xs text-zinc-500 mb-2">Freelancer</div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold">
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
                                <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
                                    <h3 className="text-sm font-medium text-zinc-400 mb-4">Status Timeline</h3>
                                    <div className="relative">
                                        {/* Progress Bar Background */}
                                        <div className="absolute top-5 left-0 right-0 h-1 bg-white/10 rounded-full" />

                                        {/* Animated Progress Bar */}
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{
                                                width: `${(getStatusIndex(selectedEscrow.status) / (STATUS_STEPS.length - 1)) * 100}%`
                                            }}
                                            transition={{ duration: 0.8, ease: "easeOut" }}
                                            className="absolute top-5 left-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"
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
                                                            }}
                                                            transition={{ duration: 0.3 }}
                                                            className={cn(
                                                                "w-10 h-10 rounded-full flex items-center justify-center border-2 z-10",
                                                                isCompleted
                                                                    ? "bg-emerald-500 border-emerald-500 shadow-[0_0_15px_-3px_rgba(16,185,129,0.6)]"
                                                                    : "bg-zinc-900 border-white/10",
                                                                isCurrent && "ring-4 ring-emerald-500/20"
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
                                                                className="absolute top-full mt-8 px-3 py-2 bg-zinc-900 border border-white/10 rounded-lg text-xs text-white whitespace-nowrap z-20"
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
                                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                                    <div className="flex items-start gap-3">
                                        <HelpCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                                        <div>
                                            <h4 className="text-sm font-medium text-emerald-400 mb-1">What happens next?</h4>
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
                                                    className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl border border-white/[0.06]"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={cn(
                                                            "w-2 h-2 rounded-full",
                                                            milestone.status === "released" && "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]",
                                                            milestone.status === "in_escrow" && "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]",
                                                            milestone.status === "pending" && "bg-zinc-600"
                                                        )} />
                                                        <span className="text-sm text-white">{milestone.name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-sm font-medium text-white">
                                                            ◎ {milestone.amount}
                                                        </span>
                                                        <span className={cn(
                                                            "text-xs px-2.5 py-1 rounded-lg font-medium",
                                                            milestone.status === "released" && "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
                                                            milestone.status === "in_escrow" && "bg-amber-500/10 text-amber-400 border border-amber-500/20",
                                                            milestone.status === "pending" && "bg-white/[0.05] text-zinc-500 border border-white/[0.06]"
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
                                <div className="flex gap-3 pt-4 border-t border-white/[0.06]">
                                    <Button
                                        variant="outline"
                                        className="flex-1 h-11 rounded-xl border-white/10 text-zinc-400 hover:bg-white/[0.05] hover:text-white"
                                    >
                                        <ExternalLink className="w-4 h-4 mr-2" />
                                        View on Explorer
                                    </Button>
                                    <Button
                                        className="flex-1 h-11 rounded-xl bg-white text-black hover:bg-zinc-200 font-bold"
                                    >
                                        {selectedEscrow.status === "submitted" ? "Review & Approve" : "View Contract"}
                                        <ArrowUpRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}

// Status Badge Component
function StatusBadge({ status }: { status: EscrowStatus }) {
    const config = {
        funded: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20", label: "Funded" },
        in_progress: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20", label: "In Progress" },
        submitted: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20", label: "Submitted" },
        approved: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20", label: "Approved" },
        released: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20", label: "Released" },
        disputed: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20", label: "Disputed" },
    }

    const { bg, text, border, label } = config[status]

    return (
        <span className={cn("px-2.5 py-0.5 rounded-lg text-xs font-medium border", bg, text, border)}>
            {label}
        </span>
    )
}
