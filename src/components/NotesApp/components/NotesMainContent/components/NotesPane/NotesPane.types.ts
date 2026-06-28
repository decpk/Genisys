import type { Note } from '@/store/notes-store'
import type { ContentWidth, NotesMode } from '@/store/settings-store'

import type { NotesDropMode, NotesDropZone } from '../NotesEditorDropZones'

export interface NotesPaneProps {
  note: Note
  /** Focused pane. In single-pane mode this is always true. */
  isActive: boolean
  mode: NotesMode
  contentWidth: ContentWidth
  showLabels: boolean
  onUpdateNote: (note: Note) => void | Promise<void>
  onModeChange: (mode: NotesMode) => void
  onContentWidthChange: (width: ContentWidth) => void
  onToggleMode: () => void
  /** Provided only in split mode; clicking the pane focuses it. */
  onFocus?: () => void
  /** Trailing toolbar controls (fullscreen + split launcher, or split controls). */
  trailing?: React.ReactNode
  /** How a dropped note is handled: open a split vs replace this pane. */
  dropMode?: NotesDropMode
  /** Called when a note is dropped onto this pane's editor area. */
  onDropNote?: (zone: NotesDropZone, noteId: string) => void
}
