import { useMemo } from 'react'

import { NOTES_SCOPE_KEY, useNotesLinkGraph } from '@/components/NotesApp/notes-links'
import { useNotesStore, type Note } from '@/store/notes-store'

import type { NotesGraphMultiGraph, NotesGraphScope } from '../NotesGraphPanel.types'
import { buildNotesGraphologyGraph } from '../utils/buildNotesGraphologyGraph'

// Module-level stable empty reference — never return a fresh literal from a
// zustand selector (avoids infinite re-render loops).
const EMPTY_NOTES: Note[] = []

export interface UseNotesGraphDataParams {
  scope: NotesGraphScope
  selectedNoteId: string | null
}

export interface UseNotesGraphDataReturn {
  graph: NotesGraphMultiGraph | null
}

/**
 * Build the (memoized) graphology graph from notes + the wiki-link graph for
 * the requested scope and selection. Returns null when there are no nodes.
 */
export function useNotesGraphData(params: UseNotesGraphDataParams): UseNotesGraphDataReturn {
  const { scope, selectedNoteId } = params
  const linkGraph = useNotesLinkGraph()
  const notes = useNotesStore((s) => s.notesByScope[NOTES_SCOPE_KEY] ?? EMPTY_NOTES)

  const graph = useMemo<NotesGraphMultiGraph | null>(() => {
    const g = buildNotesGraphologyGraph({ notes, linkGraph, scope, selectedNoteId })
    return g.order === 0 ? null : g
  }, [linkGraph, notes, scope, selectedNoteId])

  return { graph }
}
