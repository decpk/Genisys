'use no memo'

import { useCallback, useEffect, useRef, useState } from 'react'

import type { Note } from '@/store/notes-store'

export type NoteSaveStatus = 'saving' | 'saved'

const SAVE_DEBOUNCE_MS = 3000

export function useNoteEditorData(
  note: Note,
  onUpdateNote: (note: Note) => void | Promise<void>,
  isReadOnly = false,
) {
  const [title, setTitle] = useState(note.title)
  const [saveStatus, setSaveStatus] = useState<NoteSaveStatus>('saved')
  const noteRef = useRef(note)
  const lastPersistedRef = useRef({ title: note.title, content: note.content })
  const isReadOnlyRef = useRef(isReadOnly)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const saveVersionRef = useRef(0)

  useEffect(() => {
    noteRef.current = note
  }, [note])

  useEffect(() => {
    isReadOnlyRef.current = isReadOnly
  }, [isReadOnly])

  const hasPendingChanges = useCallback(() => {
    const current = noteRef.current
    return (
      current.title !== lastPersistedRef.current.title ||
      current.content !== lastPersistedRef.current.content
    )
  }, [])

  const runSave = useCallback(
    (saveVersion: number) => {
      const current = noteRef.current
      const toSave: Note = {
        ...current,
        title: current.title,
        content: current.content,
      }

      Promise.resolve(onUpdateNote(toSave))
        .then(() => {
          lastPersistedRef.current = {
            title: toSave.title,
            content: toSave.content,
          }
          if (saveVersionRef.current === saveVersion) {
            setSaveStatus('saved')
          }
        })
        .catch(() => {
          // Keep "saving" state on failure so it is obvious persistence did not complete.
        })
    },
    [onUpdateNote],
  )

  const persistUpdate = useCallback(
    () => {
      if (isReadOnlyRef.current) return
      if (!hasPendingChanges()) return
      saveVersionRef.current += 1
      const saveVersion = saveVersionRef.current
      setSaveStatus('saving')

      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        runSave(saveVersion)
      }, SAVE_DEBOUNCE_MS)
    },
    [hasPendingChanges, runSave],
  )

  // Sync title when switching notes (content handled by key prop remount)
  const prevNoteIdRef = useRef(note.id)
  useEffect(() => {
    if (note.id !== prevNoteIdRef.current) {
      prevNoteIdRef.current = note.id
      setTitle(note.title)
      setSaveStatus('saved')
      noteRef.current = note
      lastPersistedRef.current = { title: note.title, content: note.content }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note.id, note.content, note.title])

  useEffect(() => {
    const handleInstantSave = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.altKey) return
      if (event.key.toLowerCase() !== 's') return

      const target = event.target as HTMLElement | null
      const isEditableTarget =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable
      if (!isEditableTarget) return

      event.preventDefault()

      if (isReadOnlyRef.current) return
      if (!hasPendingChanges()) return

      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
        debounceRef.current = null
      }

      saveVersionRef.current += 1
      const saveVersion = saveVersionRef.current
      setSaveStatus('saving')
      runSave(saveVersion)
    }

    document.addEventListener('keydown', handleInstantSave)
    return () => document.removeEventListener('keydown', handleInstantSave)
  }, [hasPendingChanges, runSave])

  // Flush debounced save on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
        debounceRef.current = null
        if (hasPendingChanges()) {
          const current = noteRef.current
          onUpdateNote(current)
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (isReadOnlyRef.current) return
      const newTitle = e.target.value
      if (newTitle === noteRef.current.title) return
      setTitle(newTitle)
      const updated = { ...noteRef.current, title: newTitle }
      noteRef.current = updated
      persistUpdate()
    },
    [persistUpdate],
  )

  const handleContentChange = useCallback(
    (markdown: string) => {
      if (isReadOnlyRef.current) return
      if (markdown === noteRef.current.content) return
      const updated = { ...noteRef.current, content: markdown }
      noteRef.current = updated
      persistUpdate()
    },
    [persistUpdate],
  )

  return { title, handleTitleChange, handleContentChange, saveStatus }
}
