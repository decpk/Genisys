import { useMemo } from 'react'
import { useNotesStore, type Note } from '@/store/notes-store'
import { NOTES_SCOPE_KEY } from '../notes-links.constants'
import { buildNotesLinkGraph } from '../utils/buildNotesLinkGraph'
import type { NotesLinkGraph } from '../notes-links.types'

// Module-level stable empty reference — never return a fresh literal from a
// zustand selector (avoids infinite re-render loops).
const EMPTY_NOTES: Note[] = []

/** Reactive wiki-link adjacency graph derived from the Notes-app notes. */
export function useNotesLinkGraph(): NotesLinkGraph {
  const notes = useNotesStore(
    (s) => s.notesByScope[NOTES_SCOPE_KEY] ?? EMPTY_NOTES,
  )
  return useMemo(() => buildNotesLinkGraph(notes), [notes])
}
