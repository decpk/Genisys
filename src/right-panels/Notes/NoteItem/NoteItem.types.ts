import type { Note } from '@/store/notes-store'

export interface NoteItemProps {
  note: Note
  isActive: boolean
  onSelect: (id: string) => void
  onDelete: (id: string) => void
  onTogglePin: (id: string) => void
  showSeparator: boolean
}
