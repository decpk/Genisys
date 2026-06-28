import { useCallback, useEffect, useRef, useState } from 'react'

const START_HOUR = 0
const HOUR_HEIGHT = 60
const TIME_GUTTER_PX = 72
const RIGHT_PAD_PX = 8
const MIN_DRAG_PX = 15

/** Snap pixel offset to nearest 15-minute interval and return "HH:mm" */
function pixelToTime(y: number): string {
  const clampedY = Math.max(0, y)
  const totalMinutes = (clampedY / HOUR_HEIGHT) * 60 + START_HOUR * 60
  const snapped = Math.round(totalMinutes / 15) * 15
  const clamped = Math.max(0, Math.min(24 * 60 - 15, snapped))
  const h = Math.floor(clamped / 60)
  const m = clamped % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

export interface TimelineDragSelection {
  startTime: string
  endTime: string
}

export interface UseTimelineDragSelectReturn {
  containerRef: React.RefObject<HTMLDivElement | null>
  onContainerMouseDown: (e: React.MouseEvent) => void
  isDragging: boolean
  selectionStyle: React.CSSProperties | null
  selectionRange: TimelineDragSelection | null
  showPopover: boolean
  setShowPopover: (show: boolean) => void
  popoverAnchorStyle: React.CSSProperties
  clearSelection: () => void
}

export function useTimelineDragSelect(): UseTimelineDragSelectReturn {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [showPopover, setShowPopover] = useState(false)
  const [selectionRange, setSelectionRange] = useState<TimelineDragSelection | null>(null)

  // Use refs for drag tracking to avoid stale closures in global listeners
  const dragState = useRef({
    active: false,
    startY: 0,
    currentY: 0,
  })

  // Pixel values for selection rendering
  const [selectionPixels, setSelectionPixels] = useState<{ top: number; height: number } | null>(
    null,
  )

  const clearSelection = useCallback(() => {
    setShowPopover(false)
    setSelectionRange(null)
    setSelectionPixels(null)
    setIsDragging(false)
    dragState.current.active = false
  }, [])

  const onContainerMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Only handle left click
      if (e.button !== 0) return

      // Don't start drag on existing event blocks
      const target = e.target as HTMLElement
      if (target.closest('[data-timeline-event]')) return

      // Calculate Y relative to the container
      const container = containerRef.current
      if (!container) return

      const rect = container.getBoundingClientRect()
      const y = e.clientY - rect.top + container.scrollTop

      // Check if click is within the event area (past the time gutter)
      const x = e.clientX - rect.left
      if (x < TIME_GUTTER_PX) return

      // Clear any previous selection
      clearSelection()

      dragState.current = { active: true, startY: y, currentY: y }
      setIsDragging(true)

      // Prevent text selection during drag
      e.preventDefault()
    },
    [clearSelection],
  )

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (!dragState.current.active) return

      const container = containerRef.current
      if (!container) return

      const rect = container.getBoundingClientRect()
      const y = e.clientY - rect.top + container.scrollTop
      dragState.current.currentY = y

      const minY = Math.min(dragState.current.startY, y)
      const maxY = Math.max(dragState.current.startY, y)

      setSelectionPixels({ top: minY, height: maxY - minY })
    }

    function handleMouseUp() {
      if (!dragState.current.active) return

      const { startY, currentY } = dragState.current
      dragState.current.active = false
      setIsDragging(false)

      const distance = Math.abs(currentY - startY)
      if (distance < MIN_DRAG_PX) {
        // Too short — treat as a click, not a drag
        setSelectionPixels(null)
        return
      }

      const minY = Math.min(startY, currentY)
      const maxY = Math.max(startY, currentY)

      const startTime = pixelToTime(minY)
      const endTime = pixelToTime(maxY)

      // Ensure we have a real range
      if (startTime === endTime) {
        setSelectionPixels(null)
        return
      }

      // Snap the visual selection to the computed times
      const snappedTop = (timeToMinutes(startTime) / 60 - START_HOUR) * HOUR_HEIGHT
      const snappedHeight =
        ((timeToMinutes(endTime) - timeToMinutes(startTime)) / 60) * HOUR_HEIGHT

      setSelectionPixels({ top: snappedTop, height: snappedHeight })
      setSelectionRange({ startTime, endTime })
      setShowPopover(true)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  // Compute style for the highlighted selection area
  const selectionStyle: React.CSSProperties | null = selectionPixels
    ? {
        position: 'absolute',
        top: selectionPixels.top,
        height: selectionPixels.height,
        left: TIME_GUTTER_PX,
        right: RIGHT_PAD_PX,
        pointerEvents: 'none',
        zIndex: 5,
      }
    : null

  // Position the popover anchor at the vertical midpoint of the selection, on the right side
  const popoverAnchorStyle: React.CSSProperties = selectionPixels
    ? {
        position: 'absolute',
        top: selectionPixels.top + selectionPixels.height / 2,
        left: `calc(${TIME_GUTTER_PX}px + (100% - ${TIME_GUTTER_PX}px - ${RIGHT_PAD_PX}px) / 2)`,
        width: 1,
        height: 1,
        pointerEvents: 'none',
      }
    : { position: 'absolute', top: 0, left: 0, width: 1, height: 1, pointerEvents: 'none' }

  return {
    containerRef,
    onContainerMouseDown,
    isDragging,
    selectionStyle,
    selectionRange,
    showPopover,
    setShowPopover,
    popoverAnchorStyle,
    clearSelection,
  }
}
