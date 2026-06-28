import type { NoteRef } from '@/components/NotesApp/notes-links'

export interface BacklinkItemProps {
  item: NoteRef
  onOpen: (noteId: string) => void
}
