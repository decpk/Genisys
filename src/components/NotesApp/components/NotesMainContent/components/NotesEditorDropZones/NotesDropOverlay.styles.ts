import type { NotesDropZone } from './NotesEditorDropZones.types'

export const notesDropOverlayStyles = {
  root: 'absolute inset-0 z-20 pointer-events-none',
  backdrop: 'absolute inset-0 bg-background/20 transition-opacity',
  highlight:
    'absolute bg-primary/15 border-2 border-primary/60 rounded-lg transition-all duration-100',
  hint:
    'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-2.5 py-1 rounded-md bg-primary text-primary-foreground text-[11px] font-medium shadow',
} as const

/** Position classes for the highlight box of each drop zone. */
export const NOTES_DROP_ZONE_CLASS: Record<NotesDropZone, string> = {
  left: 'left-0 top-0 w-1/2 h-full',
  right: 'right-0 top-0 w-1/2 h-full',
  top: 'top-0 left-0 w-full h-1/2',
  bottom: 'bottom-0 left-0 w-full h-1/2',
  center: 'inset-0',
}

/** Short label shown inside the active zone while dragging. */
export const NOTES_DROP_ZONE_LABEL: Record<NotesDropZone, string> = {
  left: 'Split left',
  right: 'Split right',
  top: 'Split top',
  bottom: 'Split bottom',
  center: 'Open here',
}
