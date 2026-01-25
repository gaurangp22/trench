import * as React from "react"
import { cn } from "@/lib/utils"

interface GradientSlideButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  className?: string
  colorFrom?: string
  colorTo?: string
}

const GradientSlideButton = React.forwardRef<
  HTMLButtonElement,
  GradientSlideButtonProps
>(
  (
    {
      children,
      className,
      colorFrom = "#F54900",
      colorTo = "#FF8904",
      style,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          "group relative inline-flex items-center justify-center overflow-hidden rounded-full px-6 py-3 text-sm font-medium transition-all duration-300 cursor-pointer",
          "bg-white/10 backdrop-blur-sm border border-white/20",
          "hover:border-white/40 hover:shadow-lg",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          className
        )}
        style={
          {
            "--gradient-from": colorFrom,
            "--gradient-to": colorTo,
            ...style,
          } as React.CSSProperties
        }
        {...props}
      >
        {/* Gradient overlay that slides in on hover */}
        <span
          className="absolute inset-0 -translate-x-full transition-transform duration-500 ease-out group-hover:translate-x-0"
          style={{
            background: `linear-gradient(90deg, ${colorFrom}, ${colorTo})`,
          }}
        />

        {/* Content */}
        <span className="relative z-10 flex items-center gap-2 text-white transition-colors duration-300">
          {children}
        </span>
      </button>
    )
  }
)

GradientSlideButton.displayName = "GradientSlideButton"

export { GradientSlideButton }
