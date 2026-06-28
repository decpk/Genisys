import { NOTES_DRAG_MIME } from '../constants'

/**
 * True when the drag event carries a Notes note payload. Usable during
 * dragenter/dragover where the actual data value cannot yet be read.
 */
export function hasNoteDragType(event: React.DragEvent): boolean {
  return Array.from(event.dataTransfer.types).includes(NOTES_DRAG_MIME)
}
