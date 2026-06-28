import { useEffect, useRef } from 'react'

import { useNotesAppStore } from '@/store/notes-app-store'
import { useNotesStore } from '@/store/notes-store'
import { useNoteNotebooksStore } from '@/store/note-notebooks-store'
import { computeNoteAncestorNodeIds } from './utils/computeNoteAncestorNodeIds'

/**
 * On first load, validates the persisted `selectedNoteId`: clears it when the
 * note was deleted/trashed, otherwise expands the sidebar tree so the note's
 * row is revealed. Runs once after notes finish loading; never overrides a
 * subsequent user selection.
 */
export function useRestoreLastOpenedNote() {
  const notesScope = useNotesStore((s) => s.notesByScope['notes-app::global::all'])
  const notebooks = useNoteNotebooksStore((s) => s.notebooks)
  const notebooksLoaded = useNoteNotebooksStore((s) => s.isLoaded)
  const hasRunRef = useRef(false)

  useEffect(() => {
    if (hasRunRef.current) return
    if (notesScope === undefined || !notebooksLoaded) return
    hasRunRef.current = true

    const { selectedNoteId, setSelectedNoteId, expandedNodeIds, setExpandedNodeIds } =
      useNotesAppStore.getState()
    if (!selectedNoteId) return

    const note = notesScope.find((n) => n.id === selectedNoteId)
    if (!note || note.isTrashed) {
      setSelectedNoteId(null)
      return
    }

    const ancestorIds = computeNoteAncestorNodeIds(note, notebooks)
    const missing = ancestorIds.filter((id) => !expandedNodeIds.includes(id))
    if (missing.length > 0) {
      setExpandedNodeIds([...expandedNodeIds, ...missing])
    }
  }, [notesScope, notebooks, notebooksLoaded])
}
