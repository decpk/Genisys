import { useCallback } from 'react'

import { useNotesAppStore } from '@/store/notes-app-store'
import { useNotesStore, type Note } from '@/store/notes-store'
import { useSettingsStore, type NotesMode } from '@/store/settings-store'

import { zoneToSplit, type NotesDropZone } from '../NotesEditorDropZones'

/**
 * Wiring for the single-pane Notes view. Mode/width come from the global Notes
 * settings (preserving the pre-split behaviour); dropping or picking a note
 * opens a split.
 */
export function useNotesMainContentSingleData() {
  const updateNote = useNotesStore((s) => s.updateNote)
  const openSplit = useNotesAppStore((s) => s.openSplit)

  const distractionFree = useNotesAppStore((s) => s.distractionFree)
  const toggleDistractionFree = useNotesAppStore((s) => s.toggleDistractionFree)
  const contentWidth = useSettingsStore((s) => s.notesContentWidth)
  const setContentWidth = useSettingsStore((s) => s.setNotesContentWidth)
  const showLabels = useSettingsStore((s) => s.notesShowLabels)
  const notesMode = useSettingsStore((s) => s.notesMode)
  const setNotesMode = useSettingsStore((s) => s.setNotesMode)

  const handleUpdateNote = useCallback(
    async (note: Note) => {
      await updateNote(note)
    },
    [updateNote],
  )

  const toggleNotesMode = useCallback(() => {
    const next: NotesMode = notesMode === 'edit' ? 'view' : 'edit'
    setNotesMode(next)
  }, [notesMode, setNotesMode])

  const handlePickSplitNote = useCallback(
    (noteId: string) => {
      openSplit(noteId, 'side-by-side', 'second')
    },
    [openSplit],
  )

  const handleDropNote = useCallback(
    (zone: NotesDropZone, noteId: string) => {
      const { orientation, side } = zoneToSplit(zone)
      openSplit(noteId, orientation, side)
    },
    [openSplit],
  )

  return {
    notesMode,
    setNotesMode,
    toggleNotesMode,
    contentWidth,
    setContentWidth,
    showLabels,
    distractionFree,
    toggleDistractionFree,
    handleUpdateNote,
    handlePickSplitNote,
    handleDropNote,
  }
}
