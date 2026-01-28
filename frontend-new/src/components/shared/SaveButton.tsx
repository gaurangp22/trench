import { Button } from "@/components/ui/Button"
import { Loader2, Save, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SaveButtonProps {
    onClick: () => void
    saving: boolean
    saveSuccess: boolean
    disabled?: boolean
    className?: string
    size?: 'sm' | 'md' | 'lg'
    variant?: 'primary' | 'secondary'
    saveLabel?: string
    savingLabel?: string
    savedLabel?: string
}

export function SaveButton({
    onClick,
    saving,
    saveSuccess,
    disabled = false,
    className,
    size = 'md',
    variant = 'primary',
    saveLabel = 'Save Changes',
    savingLabel = 'Saving...',
    savedLabel = 'Saved!'
}: SaveButtonProps) {
    const sizeClasses = {
        sm: 'h-9 px-4 text-sm',
        md: 'h-11 px-6',
        lg: 'h-12 px-8'
    }

    const variantClasses = {
        primary: saveSuccess
            ? "bg-indigo-500 hover:bg-indigo-600 text-white"
            : "bg-white text-black hover:bg-zinc-200",
        secondary: saveSuccess
            ? "bg-indigo-500/20 border-indigo-500/30 text-indigo-400"
            : "bg-white/[0.03] border-white/10 text-zinc-300 hover:bg-white/[0.06]"
    }

    return (
        <Button
            onClick={onClick}
            disabled={saving || disabled}
            className={cn(
                "rounded-xl font-bold transition-all",
                sizeClasses[size],
                variantClasses[variant],
                className
            )}
        >
            {saving ? (
                <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {savingLabel}
                </>
            ) : saveSuccess ? (
                <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {savedLabel}
                </>
            ) : (
                <>
                    <Save className="w-4 h-4 mr-2" />
                    {saveLabel}
                </>
            )}
        </Button>
    )
}
