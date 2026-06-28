export interface NotesSplitButtonProps {
  currentNoteId: string
  onPick: (noteId: string) => void
  isCompact: boolean
}

export interface NotesSplitPickerItem {
  id: string
  title: string
}
