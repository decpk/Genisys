import { useState, useRef, useCallback } from 'react'

export function useSplitResize(
  containerRef: React.RefObject<HTMLDivElement | null>,
  defaultFraction: number = 0.5,
  minFraction: number = 0.25,
  maxFraction: number = 0.75,
) {
  const [leftFraction, setLeftFraction] = useState(defaultFraction)
  const isResizingRef = useRef(false)
  const rafRef = useRef(0)

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      isResizingRef.current = true

      const onMouseMove = (moveEvent: MouseEvent) => {
        if (!isResizingRef.current) return
        const container = containerRef.current
        if (!container) return

        cancelAnimationFrame(rafRef.current)
        rafRef.current = requestAnimationFrame(() => {
          const rect = container.getBoundingClientRect()
          const x = moveEvent.clientX - rect.left
          const fraction = Math.min(maxFraction, Math.max(minFraction, x / rect.width))
          setLeftFraction(fraction)
        })
      }

      const onMouseUp = () => {
        isResizingRef.current = false
        cancelAnimationFrame(rafRef.current)
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUp)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }

      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
    },
    [containerRef, minFraction, maxFraction],
  )

  return { leftFraction, handleMouseDown }
}
