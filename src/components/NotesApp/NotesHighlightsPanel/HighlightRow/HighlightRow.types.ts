import type { NoteHighlight } from '@/store/note-highlights-store'

export interface HighlightRowProps {
  highlight: NoteHighlight
  noteTitle: string
  isExpanded: boolean
  onToggle: () => void
  onNavigate: () => void
  onRemove: () => void
}
