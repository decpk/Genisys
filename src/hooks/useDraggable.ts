import { useCallback, useRef, useState } from 'react'

export interface UseDraggablePosition {
  x: number
  y: number
}

export interface UseDraggableOptions {
  /**
   * Current position (controlled). Used as the starting point for each
   * drag and as the rendered position when no drag is in progress.
   */
  position: UseDraggablePosition
  /**
   * Optional ref to the element being dragged. When provided, the hook
   * mutates `targetRef.current.style.transform` directly via
   * `requestAnimationFrame` instead of triggering React re-renders on
   * every pointer event — yielding a steady 60fps drag.
   *
   * The CALLER is responsible for applying the initial transform on
   * render (e.g. `transform: translate3d(x, y, 0)`); the hook writes
   * the same property during drag.
   */
  targetRef?: React.RefObject<HTMLElement | null>
  /** Called once per drag, on pointer-up, with the final position. */
  onDragEnd?: (position: UseDraggablePosition) => void
  /** Called continuously during drag — useful for live UI hints. */
  onDrag?: (position: UseDraggablePosition) => void
  /** Disable the drag handlers (still returns last position). */
  disabled?: boolean
  /**
   * Optional filter: return true to skip drag for a particular event
   * (e.g. clicks on the close button inside the drag region).
   */
  shouldIgnore?: (event: React.PointerEvent) => boolean
}

export interface UseDraggableReturn {
  /**
   * Committed position. Updates only on pointer-up (when `targetRef` is
   * provided) or on every move (when not). Always safe to render with.
   */
  position: UseDraggablePosition
  /** Whether a drag is in progress. */
  isDragging: boolean
  /** Attach to the element that should act as the drag handle. */
  handleProps: {
    onPointerDown: (event: React.PointerEvent) => void
  }
}

/**
 * Pointer-based drag hook. Two performance modes:
 *
 *   1. **Imperative (preferred)** — pass `targetRef`. The hook writes
 *      `transform: translate3d(x, y, 0)` directly to the element on a
 *      `requestAnimationFrame` schedule. React state updates only when
 *      the drag ends. The caller must render an initial transform from
 *      the returned `position`.
 *   2. **Controlled** — omit `targetRef`. The hook calls `setState` on
 *      every pointermove (with the same rAF throttling) so the caller
 *      can re-render directly. Simpler but heavier.
 *
 * Either way, `onDragEnd` fires once with the final position and
 * `isDragging` toggles for class-name purposes.
 */
export function useDraggable({
  position,
  targetRef,
  onDragEnd,
  onDrag,
  disabled = false,
  shouldIgnore,
}: UseDraggableOptions): UseDraggableReturn {
  const [committedPosition, setCommittedPosition] = useState(position)
  const [isDragging, setIsDragging] = useState(false)
  const [lastSyncedPosition, setLastSyncedPosition] = useState(position)

  // Mirror external position changes that happen outside of a drag
  // (viewport clamp, store hydration). Using the "store previous prop"
  // pattern instead of `useEffect` per react-hooks lint rules.
  if (
    !isDragging &&
    (lastSyncedPosition.x !== position.x ||
      lastSyncedPosition.y !== position.y)
  ) {
    setLastSyncedPosition(position)
    setCommittedPosition(position)
  }

  // Stable rAF handle so we never schedule more than one frame at a time.
  const rafIdRef = useRef<number | null>(null)
  const pendingPositionRef = useRef<UseDraggablePosition>(position)

  const handlePointerDown = useCallback(
    (event: React.PointerEvent) => {
      if (disabled) return
      if (event.button !== 0) return
      if (shouldIgnore?.(event)) return

      event.preventDefault()

      const startPointerX = event.clientX
      const startPointerY = event.clientY
      const startX = position.x
      const startY = position.y

      setIsDragging(true)
      pendingPositionRef.current = { x: startX, y: startY }

      const flushFrame = () => {
        rafIdRef.current = null
        const next = pendingPositionRef.current
        const el = targetRef?.current
        if (el) {
          el.style.transform = `translate3d(${next.x}px, ${next.y}px, 0)`
        } else {
          // Controlled fallback: drive React state directly.
          setCommittedPosition(next)
        }
        onDrag?.(next)
      }

      const handleMove = (e: PointerEvent) => {
        const dx = e.clientX - startPointerX
        const dy = e.clientY - startPointerY
        pendingPositionRef.current = { x: startX + dx, y: startY + dy }
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
        const final = pendingPositionRef.current
        // Sync React state to the final imperative value so future
        // renders match the DOM. Also marks `lastSyncedPosition` so the
        // render-time sync block doesn't trigger.
        setLastSyncedPosition(final)
        setCommittedPosition(final)
        setIsDragging(false)
        onDragEnd?.(final)
      }

      window.addEventListener('pointermove', handleMove)
      window.addEventListener('pointerup', handleUp)
      window.addEventListener('pointercancel', handleUp)
    },
    [
      disabled,
      onDrag,
      onDragEnd,
      position.x,
      position.y,
      shouldIgnore,
      targetRef,
    ],
  )

  return {
    position: committedPosition,
    isDragging,
    handleProps: { onPointerDown: handlePointerDown },
  }
}
