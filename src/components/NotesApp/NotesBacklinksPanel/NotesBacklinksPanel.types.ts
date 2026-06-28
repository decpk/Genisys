import type { NoteRef } from '@/components/NotesApp/notes-links'

export interface NotesBacklinksPanelData {
  /** True when a note is selected and resolves to a known note. */
  hasSelection: boolean
  /** True when the selected note has a non-empty title (links resolve by title). */
  hasTitle: boolean
  /** Notes linking to the current note via `[[Title]]`. */
  backlinks: NoteRef[]
  /** Notes mentioning the current title in plain text without linking. */
  unlinkedMentions: NoteRef[]
  /** Open a note by id in the Notes app. */
  handleOpen: (noteId: string) => void
}
