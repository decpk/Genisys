import { NOTES_DRAG_MIME } from '../constants'

/** Reads the dropped note id from a drag event, or null when absent. */
export function getNoteDragId(event: React.DragEvent): string | null {
  const id = event.dataTransfer.getData(NOTES_DRAG_MIME)
  return id ? id : null
}
