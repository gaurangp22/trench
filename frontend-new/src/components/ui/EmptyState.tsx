import { Link } from "react-router-dom"
import { FileText, Briefcase, MessageSquare, Wallet, Search, Users, Shield, Plus } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { cn } from "@/lib/utils"

// Predefined empty state configurations
const EMPTY_STATE_CONFIGS = {
    jobs: {
        icon: Briefcase,
        title: "No jobs match your filters",
        description: "Try adjusting your filters or browse all available opportunities",
        primaryAction: { label: "Clear Filters", href: "" },
        secondaryAction: { label: "Browse All Jobs", href: "/jobs" }
    },
    proposals: {
        icon: FileText,
        title: "No proposals yet",
        description: "Start applying to jobs that match your skills. Your first proposal could lead to your next project!",
        primaryAction: { label: "Find Work", href: "/jobs" },
        tip: "💡 Jobs with funded escrow often hire faster"
    },
    contracts: {
        icon: Shield,
        title: "No active contracts",
        description: "Once you're hired, your contracts will appear here with escrow details and milestones",
        primaryAction: { label: "Browse Jobs", href: "/jobs" }
    },
    messages: {
        icon: MessageSquare,
        title: "No messages yet",
        description: "Start a conversation with a client or freelancer about a project",
        tip: "💡 Messages are linked to escrow contracts for easy reference"
    },
    escrow: {
        icon: Wallet,
        title: "No escrow contracts",
        description: "Your secured payments will appear here once you start a contract",
        primaryAction: { label: "Get Started", href: "/jobs" }
    },
    myJobs: {
        icon: Plus,
        title: "You haven't posted any jobs yet",
        description: "Create your first job posting to find talented freelancers",
        primaryAction: { label: "Post a Job", href: "/client/post-job" },
        tip: "💡 Fund escrow upfront to attract more qualified proposals"
    },
    talent: {
        icon: Users,
        title: "No freelancers found",
        description: "Try different search terms or browse by category",
        primaryAction: { label: "Browse All Talent", href: "/talent" }
    },
    searchResults: {
        icon: Search,
        title: "No results found",
        description: "We couldn't find anything matching your search. Try different keywords",
        primaryAction: { label: "Clear Search", href: "" }
    }
}

type EmptyStateType = keyof typeof EMPTY_STATE_CONFIGS

interface EmptyStateProps {
    type: EmptyStateType
    customTitle?: string
    customDescription?: string
    onPrimaryAction?: () => void
    className?: string
}

export function EmptyState({
    type,
    customTitle,
    customDescription,
    onPrimaryAction,
    className
}: EmptyStateProps) {
    const config = EMPTY_STATE_CONFIGS[type]
    const Icon = config.icon

    return (
        <div className={cn(
            "flex flex-col items-center justify-center py-16 px-6 text-center",
            className
        )}>
            {/* Icon Container */}
            <div className="w-16 h-16 rounded-full bg-zinc-800/50 flex items-center justify-center mb-6">
                <Icon className="w-8 h-8 text-zinc-500" />
            </div>

            {/* Title */}
            <h3 className="text-xl font-semibold text-white mb-2">
                {customTitle || config.title}
            </h3>

            {/* Description */}
            <p className="text-zinc-400 max-w-md mb-6">
                {customDescription || config.description}
            </p>

            {/* Tip */}
            {'tip' in config && config.tip && (
                <p className="text-sm text-purple-400 mb-6">
                    {config.tip}
                </p>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3">
                {'primaryAction' in config && config.primaryAction && (
                    config.primaryAction.href ? (
                        <Link to={config.primaryAction.href}>
                            <Button className="bg-gradient-to-r from-indigo-500 to-violet-500 text-white">
                                {config.primaryAction.label}
                            </Button>
                        </Link>
                    ) : (
                        <Button
                            onClick={onPrimaryAction}
                            className="bg-gradient-to-r from-indigo-500 to-violet-500 text-white"
                        >
                            {config.primaryAction.label}
                        </Button>
                    )
                )}
                {'secondaryAction' in config && config.secondaryAction && (
                    <Link to={config.secondaryAction.href}>
                        <Button variant="outline" className="border-zinc-700 text-zinc-300">
                            {config.secondaryAction.label}
                        </Button>
                    </Link>
                )}
            </div>
        </div>
    )
}

// Inline empty state for smaller areas
export function EmptyStateInline({
    message,
    actionLabel,
    actionHref,
    onAction,
    className
}: {
    message: string
    actionLabel?: string
    actionHref?: string
    onAction?: () => void
    className?: string
}) {
    return (
        <div className={cn(
            "p-6 bg-zinc-900/20 border border-dashed border-zinc-800 rounded-xl text-center",
            className
        )}>
            <p className="text-zinc-400 text-sm mb-3">{message}</p>
            {actionLabel && (
                actionHref ? (
                    <Link to={actionHref}>
                        <Button size="sm" variant="outline" className="border-zinc-700 text-zinc-300">
                            {actionLabel}
                        </Button>
                    </Link>
                ) : (
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={onAction}
                        className="border-zinc-700 text-zinc-300"
                    >
                        {actionLabel}
                    </Button>
                )
            )}
        </div>
    )
}
