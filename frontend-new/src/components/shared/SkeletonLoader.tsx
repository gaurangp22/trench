import { cn } from "@/lib/utils"

export interface SkeletonProps {
    className?: string
}

/**
 * Basic skeleton element
 */
export function Skeleton({ className }: SkeletonProps) {
    return (
        <div className={cn(
            "bg-white/[0.06] rounded animate-pulse",
            className
        )} />
    )
}

/**
 * Skeleton for stat cards (used in dashboards)
 */
export function StatCardSkeleton({ className }: SkeletonProps) {
    return (
        <div className={cn(
            "h-32 bg-white/[0.02] rounded-2xl border border-white/[0.04] animate-pulse",
            className
        )} />
    )
}

/**
 * Skeleton for list items (jobs, contracts, etc.)
 */
export function ListItemSkeleton({ className }: SkeletonProps) {
    return (
        <div className={cn(
            "h-24 bg-white/[0.02] rounded-2xl border border-white/[0.04] animate-pulse",
            className
        )} />
    )
}

/**
 * Skeleton for card content
 */
export function CardSkeleton({ className }: SkeletonProps) {
    return (
        <div className={cn(
            "bg-white/[0.02] rounded-2xl border border-white/[0.04] p-6 animate-pulse",
            className
        )}>
            <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-white/[0.06]" />
                <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 bg-white/[0.06] rounded" />
                    <div className="h-3 w-1/2 bg-white/[0.04] rounded" />
                </div>
            </div>
            <div className="space-y-2">
                <div className="h-3 bg-white/[0.04] rounded" />
                <div className="h-3 w-5/6 bg-white/[0.04] rounded" />
            </div>
        </div>
    )
}

/**
 * Dashboard loading skeleton
 */
export function DashboardSkeleton() {
    return (
        <div className="space-y-8">
            {/* Header Skeleton */}
            <div className="flex items-center justify-between">
                <div className="space-y-3">
                    <div className="h-4 w-24 bg-white/[0.03] rounded animate-pulse" />
                    <div className="h-10 w-72 bg-white/[0.05] rounded-lg animate-pulse" />
                </div>
                <div className="h-12 w-36 bg-white/[0.05] rounded-xl animate-pulse" />
            </div>

            {/* Stats Skeleton */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <StatCardSkeleton key={i} />
                ))}
            </div>

            {/* Content Skeleton */}
            <div className="grid lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <ListItemSkeleton key={i} />
                    ))}
                </div>
                <div className="lg:col-span-2 h-80 bg-white/[0.02] rounded-2xl border border-white/[0.04] animate-pulse" />
            </div>
        </div>
    )
}

/**
 * Job list loading skeleton
 */
export function JobListSkeleton({ count = 6 }: { count?: number }) {
    return (
        <div className="space-y-4">
            {[...Array(count)].map((_, i) => (
                <CardSkeleton key={i} />
            ))}
        </div>
    )
}

/**
 * Profile loading skeleton
 */
export function ProfileSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Avatar & Name */}
            <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-2xl bg-white/[0.06]" />
                <div className="space-y-3">
                    <div className="h-6 w-48 bg-white/[0.06] rounded" />
                    <div className="h-4 w-32 bg-white/[0.04] rounded" />
                </div>
            </div>

            {/* Bio */}
            <div className="space-y-2">
                <div className="h-4 bg-white/[0.04] rounded" />
                <div className="h-4 w-5/6 bg-white/[0.04] rounded" />
                <div className="h-4 w-4/6 bg-white/[0.04] rounded" />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-20 bg-white/[0.04] rounded-xl" />
                ))}
            </div>
        </div>
    )
}
