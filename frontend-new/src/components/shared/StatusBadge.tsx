import { cn } from "@/lib/utils"

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral'

export interface StatusBadgeProps {
    status: string
    variant?: BadgeVariant
    size?: 'sm' | 'md'
    className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
    success: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    warning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    error: 'bg-red-500/20 text-red-400 border-red-500/30',
    info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    neutral: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30'
}

/**
 * Auto-detect variant from common status strings
 */
function getVariantFromStatus(status: string): BadgeVariant {
    const s = status.toLowerCase()

    if (['open', 'active', 'approved', 'completed', 'hired', 'available'].includes(s)) {
        return 'success'
    }
    if (['pending', 'submitted', 'shortlisted', 'in_progress', 'busy'].includes(s)) {
        return 'warning'
    }
    if (['rejected', 'cancelled', 'disputed', 'withdrawn', 'not_available'].includes(s)) {
        return 'error'
    }
    if (['draft', 'revision_requested'].includes(s)) {
        return 'info'
    }
    return 'neutral'
}

export function StatusBadge({
    status,
    variant,
    size = 'sm',
    className
}: StatusBadgeProps) {
    const resolvedVariant = variant || getVariantFromStatus(status)

    const sizeClasses = {
        sm: 'px-2 py-0.5 text-[10px]',
        md: 'px-2.5 py-1 text-xs'
    }

    // Format status for display (e.g., "in_progress" -> "In Progress")
    const displayStatus = status
        .replace(/_/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase())

    return (
        <span className={cn(
            "inline-flex items-center rounded-full border font-semibold uppercase tracking-wider",
            sizeClasses[size],
            variantClasses[resolvedVariant],
            className
        )}>
            {displayStatus}
        </span>
    )
}
