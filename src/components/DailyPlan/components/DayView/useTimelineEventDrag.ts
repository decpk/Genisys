import { useCallback, useEffect, useRef, useState } from 'react'
import type { LayoutEvent } from '../../utils/computeTimelineLayout'
import type { DPTask, DPMeeting } from '../../DailyPlan.types'
import { pixelToSnappedMinutes } from './utils/pixelToSnappedMinutes'
import { minutesToTime } from './utils/minutesToTime'

export type DragMode = 'move' | 'resize-top' | 'resize-bottom'

const HOUR_HEIGHT = 60
const START_HOUR = 0
const MIN_DURATION_MINUTES = 15
const DRAG_THRESHOLD_PX = 5

interface DragPreview {
  eventId: string
  topPx: number
  heightPx: number
  startTime: string
  endTime: string
}

interface DragState {
  event: LayoutEvent
  mode: DragMode
  startClientY: number
  originalStartMin: number
  originalEndMin: number
  hasMoved: boolean
}

function minutesToPx(minutes: number): number {
  return ((minutes / 60) - START_HOUR) * HOUR_HEIGHT
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

interface UseTimelineEventDragParams {
  containerRef: React.RefObject<HTMLDivElement | null>
  saveTask: (task: DPTask) => Promise<void>
  saveMeeting: (meeting: DPMeeting) => Promise<void>
}

interface UseTimelineEventDragReturn {
  onEventMouseDown: (event: LayoutEvent, mode: DragMode, e: React.MouseEvent) => void
  dragPreview: DragPreview | null
  isDraggingEvent: boolean
  draggedEventId: string | null
  didDragRef: React.RefObject<boolean>
}

export function useTimelineEventDrag(params: UseTimelineEventDragParams): UseTimelineEventDragReturn {
  const { containerRef, saveTask, saveMeeting } = params

  const [dragPreview, setDragPreview] = useState<DragPreview | null>(null)
  const dragPreviewRef = useRef<DragPreview | null>(null)
  const [isDraggingEvent, setIsDraggingEvent] = useState(false)
  const [draggedEventId, setDraggedEventId] = useState<string | null>(null)
  const dragStateRef = useRef<DragState | null>(null)
  const didDragRef = useRef(false)

  const onEventMouseDown = useCallback(
    (event: LayoutEvent, mode: DragMode, e: React.MouseEvent) => {
      if (e.button !== 0) return
      e.preventDefault()
      e.stopPropagation()

      const originalStartMin = event.startMinutes
      const originalEndMin = event.endMinutes

      dragStateRef.current = {
        event,
        mode,
        startClientY: e.clientY,
        originalStartMin,
        originalEndMin,
        hasMoved: false,
      }

      didDragRef.current = false
    },
    [],
  )

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      const drag = dragStateRef.current
      if (!drag) return

      const deltaY = e.clientY - drag.startClientY

      // Check threshold before starting visual drag
      if (!drag.hasMoved) {
        if (Math.abs(deltaY) < DRAG_THRESHOLD_PX) return
        drag.hasMoved = true
        didDragRef.current = true
        setIsDraggingEvent(true)
        setDraggedEventId(drag.event.id)

        const cursorStyle = drag.mode === 'move' ? 'grabbing' : 'ns-resize'
        document.body.style.cursor = cursorStyle
        document.body.style.userSelect = 'none'
      }

      const container = containerRef.current
      if (!container) return

      const rect = container.getBoundingClientRect()
      const mouseYInContainer = e.clientY - rect.top + container.scrollTop

      const { mode, originalStartMin, originalEndMin } = drag
      const duration = originalEndMin - originalStartMin

      let newStartMin: number
      let newEndMin: number

      if (mode === 'move') {
        const snappedMouseMin = pixelToSnappedMinutes(mouseYInContainer)
        // Offset: where in the card was the grab? Approximate by centering on original start
        const grabOffsetMin = originalStartMin - pixelToSnappedMinutes(drag.startClientY - rect.top + container.scrollTop)
        newStartMin = snappedMouseMin + grabOffsetMin
        newEndMin = newStartMin + duration

        // Clamp within day bounds
        if (newStartMin < 0) {
          newStartMin = 0
          newEndMin = duration
        }
        if (newEndMin > 24 * 60) {
          newEndMin = 24 * 60
          newStartMin = newEndMin - duration
        }
      } else if (mode === 'resize-top') {
        newStartMin = pixelToSnappedMinutes(mouseYInContainer)
        newEndMin = originalEndMin
        // Enforce minimum duration
        if (newStartMin > newEndMin - MIN_DURATION_MINUTES) {
          newStartMin = newEndMin - MIN_DURATION_MINUTES
        }
        if (newStartMin < 0) newStartMin = 0
      } else {
        // resize-bottom
        newStartMin = originalStartMin
        newEndMin = pixelToSnappedMinutes(mouseYInContainer)
        // Enforce minimum duration
        if (newEndMin < newStartMin + MIN_DURATION_MINUTES) {
          newEndMin = newStartMin + MIN_DURATION_MINUTES
        }
        if (newEndMin > 24 * 60) newEndMin = 24 * 60
      }

      const newPreview = {
        eventId: drag.event.id,
        topPx: minutesToPx(newStartMin),
        heightPx: minutesToPx(newEndMin) - minutesToPx(newStartMin),
        startTime: minutesToTime(newStartMin),
        endTime: minutesToTime(newEndMin),
      }
      dragPreviewRef.current = newPreview
      setDragPreview(newPreview)
    }

    function handleMouseUp() {
      const drag = dragStateRef.current
      if (!drag) return

      dragStateRef.current = null
      document.body.style.cursor = ''
      document.body.style.userSelect = ''

      if (!drag.hasMoved) {
        // No meaningful movement — treat as click (handled by the card's onClick)
        setIsDraggingEvent(false)
        setDraggedEventId(null)
        dragPreviewRef.current = null
        setDragPreview(null)
        return
      }

      const preview = dragPreviewRef.current
      if (!preview) {
        setIsDraggingEvent(false)
        setDraggedEventId(null)
        return
      }

      // Persist the changes
      const { event } = drag
      if (event.type === 'task' && event.task) {
        const updatedTask: DPTask = {
          ...event.task,
          scheduledTime: preview.startTime,
          durationMinutes: timeToMinutes(preview.endTime) - timeToMinutes(preview.startTime),
        }
        saveTask(updatedTask)
      } else if (event.type === 'meeting' && event.meeting) {
        const updatedMeeting: DPMeeting = {
          ...event.meeting,
          startTime: preview.startTime,
          endTime: preview.endTime,
        }
        saveMeeting(updatedMeeting)
      }

      // Use a microtask to clear drag state so the click suppression still works
      // during the synchronous event processing after mouseup
      requestAnimationFrame(() => {
        setIsDraggingEvent(false)
        setDraggedEventId(null)
        dragPreviewRef.current = null
        setDragPreview(null)
      })
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [containerRef, saveTask, saveMeeting])

  return {
    onEventMouseDown,
    dragPreview,
    isDraggingEvent,
    draggedEventId,
    didDragRef,
  }
}
