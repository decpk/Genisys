import { useCallback, useEffect, useMemo } from 'react'

import { useNotesAppStore } from '@/store/notes-app-store'
import { useNotesStore, type Note } from '@/store/notes-store'
import { useSettingsStore } from '@/store/settings-store'

const EMPTY_NOTES: Note[] = []
const NOTES_SCOPE_KEY = 'notes-app::global::all'

export function useNotesMainContentData() {
  const selectedNoteId = useNotesAppStore((s) => s.selectedNoteId)
  const setSelectedNoteId = useNotesAppStore((s) => s.setSelectedNoteId)
  const splitState = useNotesAppStore((s) => s.splitState)
  const reconcileSplitWithNotes = useNotesAppStore((s) => s.reconcileSplitWithNotes)

  const allNotes = useNotesStore((s) => s.notesByScope[NOTES_SCOPE_KEY] ?? EMPTY_NOTES)
  // Distinguishes "notes still loading" (scope key absent) from "loaded but
  // empty" (scope key present, empty array). Reconciliation must wait for a
  // real load, otherwise a persisted split is wiped before its notes arrive.
  const notesLoaded = useNotesStore((s) => s.notesByScope[NOTES_SCOPE_KEY] !== undefined)

  const selectedNote = useMemo(
    () => allNotes.find((n) => n.id === selectedNoteId) ?? null,
    [allNotes, selectedNoteId],
  )

  // Whether the persisted/active split still references two existing notes.
  const splitNotesValid = useMemo(() => {
    if (!splitState) return false
    const ids = new Set(allNotes.map((n) => n.id))
    return ids.has(splitState.panes[0].noteId) && ids.has(splitState.panes[1].noteId)
  }, [splitState, allNotes])

  // Render the split as soon as one is present. While notes are still loading
  // we render it optimistically so a persisted split does not flash to the
  // single-note view before its notes hydrate.
  const renderSplit = !!splitState && (splitNotesValid || !notesLoaded)

  // Drop a split whose notes were deleted (covers restore-on-load and
  // mid-session deletions). Only runs once notes have actually loaded so a
  // persisted split is never cleared during the initial async load.
  useEffect(() => {
    if (!notesLoaded || !splitState || splitNotesValid) return
    reconcileSplitWithNotes(new Set(allNotes.map((n) => n.id)))
  }, [notesLoaded, splitState, splitNotesValid, allNotes, reconcileSplitWithNotes])

  const handleAddPage = useCallback(async () => {
    const addNote = useNotesStore.getState().addNote
    const note = await addNote('notes-app', 'global', 'all')
    // New notes open in Edit mode (single-pane view derives mode from global notesMode).
    useSettingsStore.getState().setNotesMode('edit')
    setSelectedNoteId(note.id)
  }, [setSelectedNoteId])

  return {
    selectedNote,
    renderSplit,
    handleAddPage,
  }
}
