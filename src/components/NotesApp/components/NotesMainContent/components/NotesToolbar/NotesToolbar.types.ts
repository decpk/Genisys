import type { Note } from '@/store/notes-store'
import type { ContentWidth, NotesMode } from '@/store/settings-store'

export interface NotesToolbarProps {
  note: Note
  title: string
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  isReadOnly: boolean
  mode: NotesMode
  onModeChange: (mode: NotesMode) => void
  contentWidth: ContentWidth
  onContentWidthChange: (width: ContentWidth) => void
  showLabels: boolean
  labelCount: number
  /** Trailing controls — single-mode fullscreen/split launcher or split controls. */
  trailing?: React.ReactNode
}
