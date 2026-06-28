import { useMemo, useState } from 'react'

import { useNotesStore, type Note } from '@/store/notes-store'

import type { NotesSplitButtonProps, NotesSplitPickerItem } from './NotesSplitButton.types'

const EMPTY_NOTES: Note[] = []
const NOTES_SCOPE_KEY = 'notes-app::global::all'

/** Provides the searchable, current-note-excluded list for the split picker. */
export function useNotesSplitButtonData(props: NotesSplitButtonProps) {
  const { currentNoteId } = props

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const allNotes = useNotesStore((s) => s.notesByScope[NOTES_SCOPE_KEY] ?? EMPTY_NOTES)

  const items = useMemo<NotesSplitPickerItem[]>(() => {
    const trimmed = query.trim().toLowerCase()
    return allNotes
      .filter((n) => !n.isTrashed && n.id !== currentNoteId)
      .filter((n) => (trimmed ? (n.title || 'Untitled').toLowerCase().includes(trimmed) : true))
      .map((n) => ({ id: n.id, title: n.title || 'Untitled' }))
  }, [allNotes, currentNoteId, query])

  return { open, setOpen, query, setQuery, items }
}
