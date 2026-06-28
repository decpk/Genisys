export type NotesDropZone = 'left' | 'right' | 'top' | 'bottom' | 'center'

export type NotesDropMode = 'split' | 'replace'

export interface UseNotesDropZonesParams {
  enabled: boolean
  mode: NotesDropMode
  onDropNote: (zone: NotesDropZone, noteId: string) => void
}

export interface NotesDropOverlayProps {
  isDragging: boolean
  activeZone: NotesDropZone | null
  mode: NotesDropMode
}
