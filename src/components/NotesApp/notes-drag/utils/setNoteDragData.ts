import { NOTES_DRAG_MIME } from '../constants'

/** Writes a note id onto a drag event so it can be dropped to open a split. */
export function setNoteDragData(event: React.DragEvent, noteId: string): void {
  event.dataTransfer.setData(NOTES_DRAG_MIME, noteId)
  event.dataTransfer.setData('text/plain', noteId)
  event.dataTransfer.effectAllowed = 'copy'
}
