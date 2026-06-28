import { useCallback, useState } from 'react'

import { getNoteDragId, hasNoteDragType } from '@/components/NotesApp/notes-drag'

import { computeDropZone } from './utils/computeDropZone'
import type { NotesDropZone, UseNotesDropZonesParams } from './NotesEditorDropZones.types'

/**
 * Drag-and-drop logic for opening / replacing a split by dropping a note onto
 * the editor area. Returns capture-phase handlers (so they take precedence over
 * the TipTap editor's own drop handling) plus visual state for the overlay.
 */
export function useNotesDropZones(params: UseNotesDropZonesParams) {
  const { enabled, mode, onDropNote } = params

  const [isDragging, setIsDragging] = useState(false)
  const [activeZone, setActiveZone] = useState<NotesDropZone | null>(null)

  const reset = useCallback(() => {
    setIsDragging(false)
    setActiveZone(null)
  }, [])

  const onDragEnterCapture = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      if (!enabled || !hasNoteDragType(e)) return
      e.preventDefault()
    },
    [enabled],
  )

  const onDragOverCapture = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      if (!enabled || !hasNoteDragType(e)) return
      e.preventDefault()
      e.dataTransfer.dropEffect = 'copy'
      const rect = e.currentTarget.getBoundingClientRect()
      setIsDragging(true)
      setActiveZone(computeDropZone(rect, e.clientX, e.clientY, mode))
    },
    [enabled, mode],
  )

  const onDragLeaveCapture = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      if (!enabled) return
      const next = e.relatedTarget as Node | null
      if (next && e.currentTarget.contains(next)) return
      reset()
    },
    [enabled, reset],
  )

  const onDropCapture = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      if (!enabled || !hasNoteDragType(e)) return
      e.preventDefault()
      e.stopPropagation()
      const id = getNoteDragId(e)
      const rect = e.currentTarget.getBoundingClientRect()
      const zone = activeZone ?? computeDropZone(rect, e.clientX, e.clientY, mode)
      reset()
      if (id) onDropNote(zone, id)
    },
    [enabled, activeZone, mode, onDropNote, reset],
  )

  const dropProps = {
    onDragEnterCapture,
    onDragOverCapture,
    onDragLeaveCapture,
    onDropCapture,
  }

  return { isDragging, activeZone, dropProps }
}
