import type { CSSProperties } from 'react'

import type { Note } from '@/store/notes-store'
import type { ContentWidth, NotesMode } from '@/store/settings-store'
import type { NotesSplitOrientation } from '@/store/notes-app-store'

export interface NotesSplitPaneProps {
  note: Note
  isActive: boolean
  mode: NotesMode
  contentWidth: ContentWidth
  showLabels: boolean
  orientation: NotesSplitOrientation
  /** Sizing for the flex item wrapping this pane. */
  style: CSSProperties
  onUpdateNote: (note: Note) => void | Promise<void>
  onModeChange: (mode: NotesMode) => void
  onContentWidthChange: (width: ContentWidth) => void
  onToggleMode: () => void
  onFocus: () => void
  onToggleOrientation: () => void
  onSwap: () => void
  /** Closes this pane, keeping the other. */
  onClose: () => void
  /** Replaces this pane's note when another note is dropped onto it. */
  onDropNote: (noteId: string) => void
}
