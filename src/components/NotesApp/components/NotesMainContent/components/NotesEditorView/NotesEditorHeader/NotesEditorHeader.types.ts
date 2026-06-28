import type { NoteLabelSummary, NoteSourceInfo } from '../../../useNoteViewModel'

export interface NotesEditorHeaderProps {
  sourceInfo: NoteSourceInfo | null
  showLabels: boolean
  noteLabels: NoteLabelSummary[]
  allLabels: NoteLabelSummary[]
  isReadOnly: boolean
  onToggleLabel: (labelId: string) => void
  labelPopoverOpen: boolean
  setLabelPopoverOpen: (open: boolean) => void
  activeLabelIds: Set<string>
}
