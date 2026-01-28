import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

export type QuickActionColor = 'indigo' | 'blue' | 'amber' | 'purple' | 'cyan' | 'rose'

export interface QuickActionLinkProps {
    href: string
    icon: LucideIcon
    label: string
    description?: string
    color: QuickActionColor
    className?: string
}

const colorMap: Record<QuickActionColor, {
    bg: string
    text: string
    hoverBg: string
}> = {
    indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', hoverBg: 'group-hover:bg-indigo-500/20' },
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', hoverBg: 'group-hover:bg-blue-500/20' },
    amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', hoverBg: 'group-hover:bg-amber-500/20' },
    purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', hoverBg: 'group-hover:bg-purple-500/20' },
    cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', hoverBg: 'group-hover:bg-cyan-500/20' },
    rose: { bg: 'bg-rose-500/10', text: 'text-rose-400', hoverBg: 'group-hover:bg-rose-500/20' },
}

export function QuickActionLink({
    href,
    icon: Icon,
    label,
    description,
    color,
    className
}: QuickActionLinkProps) {
    const c = colorMap[color]

    return (
        <Link
            to={href}
            className={cn(
                "group flex items-center gap-3 p-3 rounded-xl",
                "bg-white/[0.02] border border-white/[0.06]",
                "hover:bg-white/[0.04] hover:border-white/[0.1]",
                "transition-all",
                className
            )}
        >
            <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                c.bg,
                c.hoverBg
            )}>
                <Icon className={cn("w-5 h-5", c.text)} />
            </div>
            <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white group-hover:text-white/90 truncate">
                    {label}
                </div>
                {description && (
                    <div className="text-xs text-zinc-500 truncate">{description}</div>
                )}
            </div>
            <ArrowRight className={cn(
                "w-4 h-4 text-zinc-500 opacity-0 -translate-x-2",
                "group-hover:opacity-100 group-hover:translate-x-0",
                "transition-all"
            )} />
        </Link>
    )
}
