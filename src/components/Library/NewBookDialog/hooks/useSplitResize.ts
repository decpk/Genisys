import { useCallback, useRef, useState } from 'react'

interface SplitResizeApi {
  leftFraction: number
  handleMouseDown: (e: React.MouseEvent) => void
}

export function useSplitResize(containerRef: React.RefObject<HTMLDivElement | null>): SplitResizeApi {
  const [leftFraction, setLeftFraction] = useState<number>(0.5)
  const isResizingRef = useRef<boolean>(false)
  const rafRef = useRef<number>(0)

  const handleMouseDown = useCallback(
    (e: React.MouseEvent): void => {
      e.preventDefault()
      isResizingRef.current = true

      const onMouseMove = (moveEvent: MouseEvent): void => {
        if (!isResizingRef.current) return
        const container = containerRef.current
        if (!container) return

        cancelAnimationFrame(rafRef.current)
        rafRef.current = requestAnimationFrame(() => {
          const rect = container.getBoundingClientRect()
          const x = moveEvent.clientX - rect.left
          const fraction = Math.min(0.75, Math.max(0.25, x / rect.width))
          setLeftFraction(fraction)
        })
      }

      const onMouseUp = (): void => {
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
    [containerRef],
  )

  return { leftFraction, handleMouseDown }
}
