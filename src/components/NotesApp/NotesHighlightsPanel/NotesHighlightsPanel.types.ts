import type { NoteHighlight } from '@/store/note-highlights-store'

export interface NotesHighlightsPanelData {
  highlights: NoteHighlight[]
  noteTitle: string
  expandedId: string | null
  toggleExpanded: (id: string) => void
  onNavigate: (highlight: NoteHighlight) => void
  onRemove: (highlight: NoteHighlight) => void
}
