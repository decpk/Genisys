'use no memo'

import { useState, useEffect, useCallback, useMemo } from 'react'

import { useNotesStore, type Note } from '@/store/notes-store'
import { useConfirmDialogStore } from '@/store/confirm-dialog-store'

import { useNotesPanelContextData } from './Notes.context'
import type { NoteScopeOption } from './Notes.types'

export function useNotesPanelData() {
  const { data, actions } = useNotesPanelContextData()
  const { appId, scopes, defaultScopeType } = data
  const { onScopeChange } = actions
  const openConfirmDialog = useConfirmDialogStore((s) => s.openConfirmDialog)

  // Active scope
  const [activeScopeIndex, setActiveScopeIndex] = useState(() => {
    if (!defaultScopeType) return 0
    const idx = scopes.findIndex((s) => s.type === defaultScopeType)
    return idx >= 0 ? idx : 0
  })
  const activeScope = scopes[activeScopeIndex] ?? scopes[0]

  // Active note
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null)

  // Store
  const notesByScope = useNotesStore((s) => s.notesByScope)
  const loadNotes = useNotesStore((s) => s.loadNotes)
  const addNote = useNotesStore((s) => s.addNote)
  const updateNote = useNotesStore((s) => s.updateNote)
  const removeNote = useNotesStore((s) => s.removeNote)
  const togglePin = useNotesStore((s) => s.togglePin)


  const scopeKey = `${appId}::${activeScope.type}::${activeScope.id}`
  const notes = useMemo(() => notesByScope[scopeKey] ?? [], [notesByScope, scopeKey])

  // Load notes for active scope
  useEffect(() => {
    if (activeScope.id) {
      loadNotes(appId, activeScope.type, activeScope.id)
    }
  }, [appId, activeScope.type, activeScope.id, loadNotes])

  // Sorted notes: pinned first, then by updatedAt desc
  const sortedNotes = useMemo(() => {
    return [...notes].sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    })
  }, [notes])

  const activeNote = useMemo(
    () => sortedNotes.find((n) => n.id === activeNoteId) ?? null,
    [sortedNotes, activeNoteId],
  )

  // Handlers
  const handleScopeChange = useCallback(
    (scope: NoteScopeOption) => {
      const idx = scopes.findIndex((s) => s.type === scope.type && s.id === scope.id)
      if (idx >= 0) {
        setActiveScopeIndex(idx)
        setActiveNoteId(null)
        onScopeChange(scope)
      }
    },
    [scopes, onScopeChange],
  )

  const handleAddNote = useCallback(async () => {
    const note = await addNote(appId, activeScope.type, activeScope.id)
    setActiveNoteId(note.id)
  }, [appId, activeScope.type, activeScope.id, addNote])

  const handleSelectNote = useCallback((id: string) => {
    setActiveNoteId(id)
  }, [])

  const handleDeleteNote = useCallback(
    async (id: string) => {
      openConfirmDialog({
        title: 'Delete note',
        description: 'Are you sure you want to delete this note? This action cannot be undone.',
        onConfirm: async () => {
          await removeNote(id, appId, activeScope.type, activeScope.id)
          if (activeNoteId === id) setActiveNoteId(null)
        },
      })
    },
    [appId, activeScope.type, activeScope.id, removeNote, activeNoteId, openConfirmDialog],
  )

  const handleTogglePin = useCallback(
    async (id: string) => {
      await togglePin(id, appId, activeScope.type, activeScope.id)
    },
    [appId, activeScope.type, activeScope.id, togglePin],
  )

  const handleUpdateNote = useCallback(
    async (note: Note) => {
      await updateNote(note)
    },
    [updateNote],
  )

  const handleBack = useCallback(() => {
    setActiveNoteId(null)
  }, [])

  return {
    scopes,
    activeScope,
    sortedNotes,
    activeNote,
    activeNoteId,
    handleScopeChange,
    handleAddNote,
    handleSelectNote,
    handleDeleteNote,
    handleTogglePin,
    handleUpdateNote,
    handleBack,
  }
}
