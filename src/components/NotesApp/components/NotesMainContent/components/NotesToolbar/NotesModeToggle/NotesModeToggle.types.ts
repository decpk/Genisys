import type { NotesMode } from '@/store/settings-store'

export interface NotesModeToggleProps {
  mode: NotesMode
  onModeChange: (mode: NotesMode) => void
  isCompact: boolean
}
