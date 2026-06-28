import type { ContentWidth, NotesMode } from '@/store/settings-store'

/** Orientation of a two-pane Notes split. */
export type NotesSplitOrientation = 'side-by-side' | 'stacked'

/** Index of a pane within a split (0 = left/top, 1 = right/bottom). */
export type NotesPaneIndex = 0 | 1

/** Which slot of a split a note targets (first = left/top, second = right/bottom). */
export type NotesSplitSide = 'first' | 'second'

/** Per-pane state in a Notes split. Each pane owns its own note, mode and width. */
export interface NotesPaneState {
  noteId: string
  mode: NotesMode
  contentWidth: ContentWidth
}

/** State describing an active two-pane split, or `null` when not split. */
export interface NotesSplitState {
  panes: [NotesPaneState, NotesPaneState]
  orientation: NotesSplitOrientation
  /** Divider position as a fraction (0..1) occupied by the first pane. */
  ratio: number
  /** Which pane currently has focus (drives the shared right panel). */
  activeIndex: NotesPaneIndex
}

/** Shape persisted to localStorage for the Notes app. */
export interface NotesAppPersistedShape {
  selectedNoteId: string | null
  splitState?: NotesSplitState | null
}
