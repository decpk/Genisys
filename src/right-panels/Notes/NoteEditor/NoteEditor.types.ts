import type { Note } from '@/store/notes-store'

export interface NoteEditorProps {
  note: Note
  onUpdateNote: (note: Note) => void
}
