import type { NoteNotebook } from '@/store/note-notebooks-store'

export interface MoveModalNotebookRowProps {
  notebook: NoteNotebook
  projectSuffix: string | null
  canExpand: boolean
  isExpanded: boolean
  isSelected: boolean
  onToggle: () => void
  onSelect: () => void
}
