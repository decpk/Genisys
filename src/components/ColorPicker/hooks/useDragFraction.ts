import { useCallback, useEffect, useRef } from 'react'

/** Receives normalized (0..1) pointer fractions within the container. */
export type DragFractionHandler = (fractionX: number, fractionY: number) => void

export interface UseDragFractionResult {
  containerRef: React.RefObject<HTMLDivElement | null>
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void
  onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void
  onPointerUp: (e: React.PointerEvent<HTMLDivElement>) => void
}

function clamp01(value: number): number {
  if (value < 0) return 0
  if (value > 1) return 1
  return value
}

/**
 * Pointer drag hook that returns normalized x/y fractions within an element.
 * Uses pointer capture so dragging continues outside the bounds.
 */
export function useDragFraction(onDrag: DragFractionHandler): UseDragFractionResult {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const onDragRef = useRef<DragFractionHandler>(onDrag)

  useEffect(() => {
    onDragRef.current = onDrag
  })

  const compute = useCallback((clientX: number, clientY: number): void => {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return
    const fx = clamp01((clientX - rect.left) / rect.width)
    const fy = clamp01((clientY - rect.top) / rect.height)
    onDragRef.current(fx, fy)
  }, [])

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>): void => {
      e.preventDefault()
      e.currentTarget.setPointerCapture(e.pointerId)
      compute(e.clientX, e.clientY)
    },
    [compute],
  )

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>): void => {
      if (!e.currentTarget.hasPointerCapture(e.pointerId)) return
      compute(e.clientX, e.clientY)
    },
    [compute],
  )

  const onPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>): void => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
  }, [])

  return { containerRef, onPointerDown, onPointerMove, onPointerUp }
}
