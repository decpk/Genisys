import { useCallback } from 'react'

import { useNotesStore } from '@/store/notes-store'
import { useNoteLabelsStore } from '@/store/note-labels-store'

import { useNoteEditorData } from '@/right-panels/Notes/NoteEditor/useNoteEditorData'
import { useNoteViewModel } from '../../useNoteViewModel'
import type { NotesPaneProps } from './NotesPane.types'

/** Composes per-pane editing state, view-model data and label toggling. */
export function useNotesPaneData(props: NotesPaneProps) {
  const { note, mode, onUpdateNote } = props
  const isReadOnly = mode === 'view'

  const { title, handleTitleChange, handleContentChange, saveStatus } = useNoteEditorData(
    note,
    onUpdateNote,
    isReadOnly,
  )

  const viewModel = useNoteViewModel(note)

  const handleToggleLabel = useCallback(
    async (labelId: string) => {
      if (isReadOnly) return
      const current = note.labels ?? []
      const next = current.includes(labelId)
        ? current.filter((id) => id !== labelId)
        : [...current, labelId]
      const updated = { ...note, labels: next, updatedAt: new Date().toISOString() }
      await useNotesStore.getState().updateNote(updated)
      useNoteLabelsStore.getState().setNoteLabels(note.id, next)
    },
    [isReadOnly, note],
  )

  return {
    isReadOnly,
    title,
    handleTitleChange,
    handleContentChange,
    saveStatus,
    viewModel,
    handleToggleLabel,
  }
}
