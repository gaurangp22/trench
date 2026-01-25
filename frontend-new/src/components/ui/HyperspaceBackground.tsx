import * as React from "react"
import { cn } from "@/lib/utils"

interface HyperspaceBackgroundProps
  extends React.HTMLAttributes<HTMLDivElement> {
  starTrailOpacity?: number
  starSpeed?: number
  starColor?: string
  starSize?: number
  starCount?: number
  className?: string
}

interface StarState {
  alpha: number
  angle: number
  x: number
  vX: number
  y: number
  vY: number
  size: number
  active: boolean
}

function hexToRgb(hex: string): [number, number, number] {
  const cleanedHex = hex.replace("#", "")
  const bigint = parseInt(cleanedHex, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return [r, g, b]
}

function randomInRange(max: number, min: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function HyperspaceBackground({
  starTrailOpacity = 0.5,
  starSpeed = 1.01,
  starColor = "#FFFFFF",
  starSize = 0.5,
  starCount = 150, // Reduced from 300
  className,
  ...props
}: HyperspaceBackgroundProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null)
  const [r, g, b] = hexToRgb(starColor)

  React.useEffect(() => {
    if (typeof window === "undefined") return

    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    const context = canvas.getContext("2d")
    if (!context) return

    let isRunning = false
    let animationFrameId: number

    const resizeCanvas = () => {
      if (container) {
        canvas.width = container.offsetWidth
        canvas.height = container.offsetHeight
      }
    }

    resizeCanvas()

    const sizeIncrement = 1.01
    const radians = Math.PI / 180

    class Star {
      state: StarState

      constructor() {
        this.state = {
          alpha: 0,
          angle: 0,
          x: 0,
          vX: 0,
          y: 0,
          vY: 0,
          size: starSize,
          active: true,
        }
        this.reset()
      }

      reset() {
        const angle = randomInRange(0, 360) * radians
        const vX = Math.cos(angle)
        const vY = Math.sin(angle)

        if (!canvas) return

        const travelled =
          Math.random() > 0.5
            ? Math.random() * Math.max(canvas.width, canvas.height) +
              Math.random() * (canvas.width * 0.24)
            : Math.random() * (canvas.width * 0.25)

        this.state = {
          alpha: Math.random(),
          angle: randomInRange(0, 360) * radians,
          x: Math.floor(vX * travelled) + canvas.width / 2,
          vX,
          y: Math.floor(vY * travelled) + canvas.height / 2,
          vY,
          size: starSize,
          active: true,
        }
      }
    }

    const stars = new Array(starCount).fill(null).map(() => new Star())

    const render = () => {
      if (!isRunning) return

      const invertedOpacity = 1 - starTrailOpacity
      context.fillStyle = `rgba(0, 0, 0, ${invertedOpacity})`
      context.fillRect(0, 0, canvas.width, canvas.height)

      for (const star of stars) {
        const { x, y, size, vX, vY } = star.state

        const newX = x + vX
        const newY = y + vY

        if (
          newX < 0 ||
          newX > canvas.width ||
          newY < 0 ||
          newY > canvas.height
        ) {
          star.reset()
        } else {
          star.state = {
            ...star.state,
            x: newX,
            vX: star.state.vX * starSpeed,
            y: newY,
            vY: star.state.vY * starSpeed,
            size: size * sizeIncrement,
          }

          context.strokeStyle = `rgba(${r}, ${g}, ${b}, ${star.state.alpha})`
          context.lineWidth = size
          context.beginPath()
          context.moveTo(x, y)
          context.lineTo(star.state.x, star.state.y)
          context.stroke()
        }
      }

      animationFrameId = requestAnimationFrame(render)
    }

    const start = () => {
      if (isRunning) return
      isRunning = true
      render()
    }

    const pause = () => {
      if (!isRunning) return
      isRunning = false
      cancelAnimationFrame(animationFrameId)
    }

    // Visibility-based pausing - only animate when in viewport
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            start()
          } else {
            pause()
          }
        })
      },
      { threshold: 0 }
    )

    observer.observe(container)

    // Debounced resize
    let resizeTimeout: NodeJS.Timeout
    const handleResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(resizeCanvas, 100)
    }

    window.addEventListener("resize", handleResize)

    return () => {
      pause()
      observer.disconnect()
      window.removeEventListener("resize", handleResize)
    }
  }, [starTrailOpacity, starSpeed, starColor, starSize, starCount, r, g, b])

  return (
    <div ref={containerRef} className={cn("absolute inset-0 h-full w-full", className)} {...props}>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  )
}
