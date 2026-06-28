import { useCallback, useMemo, useRef } from 'react'

import { useNotesStore, type Note } from '@/store/notes-store'
import { useSettingsStore } from '@/store/settings-store'
import { useNotesAppStore, type NotesPaneIndex } from '@/store/notes-app-store'
import { NOTES_SPLIT_DEFAULT_RATIO } from '@/store/notes-app-store/split.constants'

const EMPTY_NOTES: Note[] = []
const NOTES_SCOPE_KEY = 'notes-app::global::all'

/** Resolves the two split panes' notes and all split interaction handlers. */
export function useNotesSplitViewData() {
  const splitState = useNotesAppStore((s) => s.splitState)
  const allNotes = useNotesStore((s) => s.notesByScope[NOTES_SCOPE_KEY] ?? EMPTY_NOTES)
  const showLabels = useSettingsStore((s) => s.notesShowLabels)
  const updateNote = useNotesStore((s) => s.updateNote)

  const setActivePane = useNotesAppStore((s) => s.setActivePane)
  const setPaneMode = useNotesAppStore((s) => s.setPaneMode)
  const setPaneContentWidth = useNotesAppStore((s) => s.setPaneContentWidth)
  const setPaneNote = useNotesAppStore((s) => s.setPaneNote)
  const setSplitRatio = useNotesAppStore((s) => s.setSplitRatio)
  const setSplitOrientation = useNotesAppStore((s) => s.setSplitOrientation)
  const swapPanes = useNotesAppStore((s) => s.swapPanes)
  const closeSplit = useNotesAppStore((s) => s.closeSplit)

  const firstId = splitState?.panes[0].noteId ?? null
  const secondId = splitState?.panes[1].noteId ?? null

  const firstNote = useMemo(
    () => allNotes.find((n) => n.id === firstId) ?? null,
    [allNotes, firstId],
  )
  const secondNote = useMemo(
    () => allNotes.find((n) => n.id === secondId) ?? null,
    [allNotes, secondId],
  )

  const containerRef = useRef<HTMLDivElement | null>(null)

  const handleUpdateNote = useCallback(
    async (note: Note) => {
      await updateNote(note)
    },
    [updateNote],
  )

  const handleToggleMode = useCallback(
    (index: NotesPaneIndex) => {
      const current = useNotesAppStore.getState().splitState
      if (!current) return
      const next = current.panes[index].mode === 'edit' ? 'view' : 'edit'
      setPaneMode(index, next)
    },
    [setPaneMode],
  )

  const handleToggleOrientation = useCallback(() => {
    const current = useNotesAppStore.getState().splitState
    if (!current) return
    setSplitOrientation(current.orientation === 'side-by-side' ? 'stacked' : 'side-by-side')
  }, [setSplitOrientation])

  const handleResetRatio = useCallback(() => {
    setSplitRatio(NOTES_SPLIT_DEFAULT_RATIO)
  }, [setSplitRatio])

  return {
    splitState,
    firstNote,
    secondNote,
    showLabels,
    containerRef,
    handleUpdateNote,
    handleToggleMode,
    handleToggleOrientation,
    handleResetRatio,
    setActivePane,
    setPaneMode,
    setPaneContentWidth,
    setPaneNote,
    setSplitRatio,
    swapPanes,
    closeSplit,
  }
}
