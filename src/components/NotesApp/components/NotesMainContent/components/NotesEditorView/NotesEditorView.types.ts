import type { Note } from '@/store/notes-store'
import type { ContentWidth } from '@/store/settings-store'

import type { NoteLabelSummary, NoteSourceInfo } from '../../useNoteViewModel'

export interface NotesEditorViewProps {
  note: Note
  noteLabels: NoteLabelSummary[]
  allLabels: NoteLabelSummary[]
  sourceInfo: NoteSourceInfo | null
  onContentChange: (markdown: string) => void
  onToggleLabel: (labelId: string) => void
  showLabels: boolean
  contentWidth: ContentWidth
  isReadOnly: boolean
  /**
   * When true this editor registers itself as the shared TOC / scroll source.
   * Only the single pane, or the active pane in a split, should be the source.
   */
  isTocSource: boolean
  /**
   * When true the editor lives inside a split pane, so the content column is
   * sized relative to the available pane width instead of an absolute column.
   */
  isInSplit: boolean
}
