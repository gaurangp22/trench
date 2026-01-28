import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

export type StatCardColor = 'indigo' | 'blue' | 'amber' | 'purple' | 'cyan' | 'rose'

export interface StatCardProps {
    icon: LucideIcon
    label: string
    value: string | number
    trend?: string
    color: StatCardColor
    delay?: number
    highlight?: boolean
    onClick?: () => void
}

const colorMap: Record<StatCardColor, {
    bg: string
    text: string
    border: string
    glow: string
}> = {
    indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20', glow: 'shadow-indigo-500/20' },
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', glow: 'shadow-blue-500/20' },
    amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', glow: 'shadow-amber-500/20' },
    purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20', glow: 'shadow-purple-500/20' },
    cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20', glow: 'shadow-cyan-500/20' },
    rose: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20', glow: 'shadow-rose-500/20' },
}

export function StatCard({
    icon: Icon,
    label,
    value,
    trend,
    color,
    delay = 0,
    highlight = false,
    onClick
}: StatCardProps) {
    const c = colorMap[color]

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            onClick={onClick}
            className={cn(
                "relative overflow-hidden rounded-2xl p-5 transition-all duration-300 group",
                "bg-white/[0.02] border border-white/[0.06]",
                "hover:bg-white/[0.04] hover:border-white/[0.1]",
                highlight && `${c.border} ${c.bg}`,
                onClick && "cursor-pointer"
            )}
        >
            {/* Glow effect on hover */}
            <div className={cn(
                "absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity -translate-y-1/2 translate-x-1/2",
                c.bg
            )} />

            <div className="relative">
                <div className="flex items-center gap-3 mb-3">
                    <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform",
                        c.bg
                    )}>
                        <Icon className={cn("w-5 h-5", c.text)} />
                    </div>
                    <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{label}</span>
                </div>
                <div className={cn(
                    "text-2xl font-bold text-white mb-1 transition-colors",
                    `group-hover:${c.text}`
                )}>
                    {value}
                </div>
                {trend && (
                    <div className="text-xs text-zinc-500">{trend}</div>
                )}
            </div>
        </motion.div>
    )
}
