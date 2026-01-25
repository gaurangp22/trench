import React, { createContext, useCallback, useContext, useEffect, useRef } from "react"
import { motion, useMotionTemplate, useMotionValue } from "motion/react"

import { cn } from "@/lib/utils"

interface MouseState {
  mousePositionX: number
  mousePositionY: number
  isWithinRange: boolean
}

const CursorCardsContext = createContext<MouseState>({
  mousePositionX: 0,
  mousePositionY: 0,
  isWithinRange: false,
})

interface CursorCardsContainerProps {
  children: React.ReactNode
  className?: string
  proximityRange?: number
}

interface CursorCardProps {
  children?: React.ReactNode
  className?: string
  illuminationRadius?: number
  illuminationColor?: string
  illuminationOpacity?: number
  primaryHue?: string
  secondaryHue?: string
  borderColor?: string
}

function useMousePosition(proximityRange: number) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [mouseState, setMouseState] = React.useState<MouseState>({
    mousePositionX: 0,
    mousePositionY: 0,
    isWithinRange: false,
  })

  const handlePointerMovement = useCallback(
    (event: PointerEvent) => {
      if (!wrapperRef.current) return

      const bounds = wrapperRef.current.getBoundingClientRect()
      const { clientX, clientY } = event

      const isInProximity =
        clientX >= bounds.left - proximityRange &&
        clientX <= bounds.right + proximityRange &&
        clientY >= bounds.top - proximityRange &&
        clientY <= bounds.bottom + proximityRange

      setMouseState({
        mousePositionX: clientX,
        mousePositionY: clientY,
        isWithinRange: isInProximity,
      })
    },
    [proximityRange]
  )

  useEffect(() => {
    document.addEventListener("pointermove", handlePointerMovement)
    return () =>
      document.removeEventListener("pointermove", handlePointerMovement)
  }, [handlePointerMovement])

  return { wrapperRef, mouseState }
}

function useCardActivation(
  elementRef: React.RefObject<HTMLDivElement | null>,
  globalMouseX: number,
  globalMouseY: number,
  isWithinRange: boolean,
  illuminationRadius: number
) {
  const localMouseX = useMotionValue(-illuminationRadius)
  const localMouseY = useMotionValue(-illuminationRadius)
  const [isCardActive, setIsCardActive] = React.useState(false)

  useEffect(() => {
    if (!elementRef.current || !isWithinRange) {
      setIsCardActive(false)
      localMouseX.set(-illuminationRadius)
      localMouseY.set(-illuminationRadius)
      return
    }

    const rect = elementRef.current.getBoundingClientRect()
    const extendedProximity = 100

    const isNearCard =
      globalMouseX >= rect.left - extendedProximity &&
      globalMouseX <= rect.right + extendedProximity &&
      globalMouseY >= rect.top - extendedProximity &&
      globalMouseY <= rect.bottom + extendedProximity

    setIsCardActive(isNearCard)

    if (isNearCard) {
      localMouseX.set(globalMouseX - rect.left)
      localMouseY.set(globalMouseY - rect.top)
    } else {
      localMouseX.set(-illuminationRadius)
      localMouseY.set(-illuminationRadius)
    }
  }, [
    globalMouseX,
    globalMouseY,
    isWithinRange,
    illuminationRadius,
    localMouseX,
    localMouseY,
    elementRef,
  ])

  return { localMouseX, localMouseY, isCardActive }
}

export function CursorCardsContainer({
  children,
  className,
  proximityRange = 400,
}: CursorCardsContainerProps) {
  const { wrapperRef, mouseState } = useMousePosition(proximityRange)

  return (
    <CursorCardsContext.Provider value={mouseState}>
      <div ref={wrapperRef} className={cn("relative", className)}>
        {children}
      </div>
    </CursorCardsContext.Provider>
  )
}

export function CursorCard({
  children,
  className,
  illuminationRadius = 200,
  illuminationColor = "#FFFFFF10",
  illuminationOpacity = 0.8,
  primaryHue = "#93C5FD",
  secondaryHue = "#2563EB",
  borderColor = "#E5E5E5",
}: CursorCardProps) {
  const { mousePositionX, mousePositionY, isWithinRange } = useContext(CursorCardsContext)
  const elementRef = useRef<HTMLDivElement>(null)
  const { localMouseX, localMouseY, isCardActive } = useCardActivation(
    elementRef,
    mousePositionX,
    mousePositionY,
    isWithinRange,
    illuminationRadius
  )

  const gradientBackground = useMotionTemplate`
    radial-gradient(${illuminationRadius}px circle at ${localMouseX}px ${localMouseY}px,
    ${primaryHue},
    ${secondaryHue},
    ${borderColor} 100%
    )
  `

  const illuminationBackground = useMotionTemplate`
    radial-gradient(${illuminationRadius}px circle at ${localMouseX}px ${localMouseY}px,
    ${illuminationColor}, transparent 100%)
  `

  return (
    <div
      ref={elementRef}
      className={cn("group relative rounded-[inherit]", className)}
    >
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={{ background: gradientBackground }}
      />
      <div className="absolute inset-px rounded-[inherit] bg-zinc-900/90" />
      <motion.div
        className={cn(
          "pointer-events-none absolute inset-px rounded-[inherit] opacity-0 transition-opacity duration-300",
          isCardActive && "opacity-100"
        )}
        style={{
          background: illuminationBackground,
          opacity: isCardActive ? illuminationOpacity : 0,
        }}
      />
      <div className="relative">{children}</div>
    </div>
  )
}
