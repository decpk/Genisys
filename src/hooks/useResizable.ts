import { useCallback, useRef, useState } from 'react'

export interface UseResizableSize {
  width: number
  height: number
}

export interface UseResizableOptions {
  /** Current size (controlled). Re-syncs when changed externally between drags. */
  size: UseResizableSize
  /**
   * Optional ref to the element being resized. When provided, the hook
   * mutates `targetRef.current.style.width/height` directly via
   * `requestAnimationFrame` instead of triggering React re-renders on
   * every pointer event.
   */
  targetRef?: React.RefObject<HTMLElement | null>
  /** Hard min/max bounds applied during the drag. */
  minWidth: number
  minHeight: number
  maxWidth: number
  maxHeight: number
  /** Live updates during the resize drag. */
  onResize?: (size: UseResizableSize) => void
  /** Final size after pointer-up — persist here. */
  onResizeEnd?: (size: UseResizableSize) => void
  /** Disable the drag handlers (still returns last size). */
  disabled?: boolean
}

export interface UseResizableReturn {
  size: UseResizableSize
  isResizing: boolean
  handleProps: {
    onPointerDown: (event: React.PointerEvent) => void
  }
}

/**
 * Bottom-right corner resize hook. Mirrors `useDraggable`'s two-mode
 * design: imperative (via `targetRef` + rAF) for 60fps, or controlled
 * (no ref) for smaller callers.
 */
export function useResizable({
  size,
  targetRef,
  minWidth,
  minHeight,
  maxWidth,
  maxHeight,
  onResize,
  onResizeEnd,
  disabled = false,
}: UseResizableOptions): UseResizableReturn {
  const [committedSize, setCommittedSize] = useState(size)
  const [isResizing, setIsResizing] = useState(false)
  const [lastSyncedSize, setLastSyncedSize] = useState(size)

  if (
    !isResizing &&
    (lastSyncedSize.width !== size.width ||
      lastSyncedSize.height !== size.height)
  ) {
    setLastSyncedSize(size)
    setCommittedSize(size)
  }

  const rafIdRef = useRef<number | null>(null)
  const pendingSizeRef = useRef<UseResizableSize>(size)

  const handlePointerDown = useCallback(
    (event: React.PointerEvent) => {
      if (disabled) return
      if (event.button !== 0) return

      event.preventDefault()
      event.stopPropagation()

      const startPointerX = event.clientX
      const startPointerY = event.clientY
      const startWidth = size.width
      const startHeight = size.height

      setIsResizing(true)
      pendingSizeRef.current = { width: startWidth, height: startHeight }

      const flushFrame = () => {
        rafIdRef.current = null
        const next = pendingSizeRef.current
        const el = targetRef?.current
        if (el) {
          el.style.width = `${next.width}px`
          el.style.height = `${next.height}px`
        } else {
          setCommittedSize(next)
        }
        onResize?.(next)
      }

      const handleMove = (e: PointerEvent) => {
        const dx = e.clientX - startPointerX
        const dy = e.clientY - startPointerY
        pendingSizeRef.current = {
          width: clamp(startWidth + dx, minWidth, maxWidth),
          height: clamp(startHeight + dy, minHeight, maxHeight),
        }
        if (rafIdRef.current == null) {
          rafIdRef.current = requestAnimationFrame(flushFrame)
        }
      }

      const handleUp = () => {
        window.removeEventListener('pointermove', handleMove)
        window.removeEventListener('pointerup', handleUp)
        window.removeEventListener('pointercancel', handleUp)
        if (rafIdRef.current != null) {
          cancelAnimationFrame(rafIdRef.current)
          rafIdRef.current = null
        }
        const final = pendingSizeRef.current
        setLastSyncedSize(final)
        setCommittedSize(final)
        setIsResizing(false)
        onResizeEnd?.(final)
      }

      window.addEventListener('pointermove', handleMove)
      window.addEventListener('pointerup', handleUp)
      window.addEventListener('pointercancel', handleUp)
    },
    [
      disabled,
      maxHeight,
      maxWidth,
      minHeight,
      minWidth,
      onResize,
      onResizeEnd,
      size.height,
      size.width,
      targetRef,
    ],
  )

  return {
    size: committedSize,
    isResizing,
    handleProps: { onPointerDown: handlePointerDown },
  }
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(Math.max(v, min), max)
}
