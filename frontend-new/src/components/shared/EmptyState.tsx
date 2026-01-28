import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/Button"
import { Link } from "react-router-dom"
import type { LucideIcon } from "lucide-react"

export interface EmptyStateProps {
    icon: LucideIcon
    title: string
    description: string
    actionLabel?: string
    actionHref?: string
    onAction?: () => void
    className?: string
    iconClassName?: string
    size?: 'sm' | 'md' | 'lg'
}

export function EmptyState({
    icon: Icon,
    title,
    description,
    actionLabel,
    actionHref,
    onAction,
    className,
    iconClassName,
    size = 'md'
}: EmptyStateProps) {
    const sizeClasses = {
        sm: {
            container: 'p-6',
            iconWrapper: 'w-10 h-10 rounded-xl',
            icon: 'w-5 h-5',
            title: 'text-base',
            description: 'text-xs',
            button: 'h-9 px-4 text-sm'
        },
        md: {
            container: 'p-12',
            iconWrapper: 'w-14 h-14 rounded-2xl',
            icon: 'w-6 h-6',
            title: 'text-lg',
            description: 'text-sm',
            button: 'h-10 px-5'
        },
        lg: {
            container: 'p-16',
            iconWrapper: 'w-16 h-16 rounded-2xl',
            icon: 'w-8 h-8',
            title: 'text-xl',
            description: 'text-base',
            button: 'h-11 px-6'
        }
    }

    const s = sizeClasses[size]

    const ActionButton = actionLabel ? (
        <Button
            onClick={onAction}
            className={cn(
                "rounded-xl bg-white text-black hover:bg-zinc-100 font-semibold",
                s.button
            )}
        >
            {actionLabel}
        </Button>
    ) : null

    return (
        <div className={cn("text-center", s.container, className)}>
            <div className={cn(
                "bg-white/[0.04] flex items-center justify-center mx-auto mb-4",
                s.iconWrapper
            )}>
                <Icon className={cn(s.icon, "text-zinc-500", iconClassName)} />
            </div>
            <h3 className={cn("font-semibold text-white mb-2", s.title)}>{title}</h3>
            <p className={cn("text-zinc-500 mb-6 max-w-sm mx-auto", s.description)}>
                {description}
            </p>
            {actionLabel && actionHref ? (
                <Link to={actionHref}>
                    {ActionButton}
                </Link>
            ) : (
                ActionButton
            )}
        </div>
    )
}
