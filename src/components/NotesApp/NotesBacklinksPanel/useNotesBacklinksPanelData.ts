import { useCallback, useMemo } from 'react'

import {
  NOTES_SCOPE_KEY,
  extractBacklinkSnippet,
  findUnlinkedMentions,
  useNotesLinkGraph,
  type NoteRef,
} from '@/components/NotesApp/notes-links'
import { useNotesAppStore } from '@/store/notes-app-store'
import { useNotesStore, type Note } from '@/store/notes-store'

import type { NotesBacklinksPanelData } from './NotesBacklinksPanel.types'

// Module-level stable empty reference — never return a fresh literal from a
// zustand selector (avoids infinite re-render loops).
const EMPTY_NOTES: Note[] = []

export function useNotesBacklinksPanelData(): NotesBacklinksPanelData {
  const selectedNoteId = useNotesAppStore((s) => s.selectedNoteId)
  const notes = useNotesStore((s) => s.notesByScope[NOTES_SCOPE_KEY] ?? EMPTY_NOTES)
  const graph = useNotesLinkGraph()

  const currentNote = useMemo(
    () => notes.find((n) => n.id === selectedNoteId) ?? null,
    [notes, selectedNoteId],
  )

  const { backlinks, unlinkedMentions } = useMemo(() => {
    const emptyResult = { backlinks: [] as NoteRef[], unlinkedMentions: [] as NoteRef[] }
    if (!selectedNoteId || !currentNote) return emptyResult

    const targetTitle = currentNote.title.trim()

    const sourceIds = graph.backward[selectedNoteId] ?? []
    const links: NoteRef[] = []
    for (const sourceId of sourceIds) {
      const source = notes.find((n) => n.id === sourceId)
      if (!source) continue
      links.push({
        noteId: source.id,
        title: source.title.trim() || 'Untitled',
        snippet: extractBacklinkSnippet(source.content, targetTitle),
      })
    }

    const mentions = targetTitle
      ? findUnlinkedMentions(notes, selectedNoteId, targetTitle)
      : ([] as NoteRef[])

    return { backlinks: links, unlinkedMentions: mentions }
  }, [graph, notes, selectedNoteId, currentNote])

  const handleOpen = useCallback((noteId: string) => {
    useNotesAppStore.getState().setSelectedNoteId(noteId)
  }, [])

  const hasSelection = Boolean(selectedNoteId && currentNote)
  const hasTitle = Boolean(currentNote && currentNote.title.trim())

  return { hasSelection, hasTitle, backlinks, unlinkedMentions, handleOpen }
}
