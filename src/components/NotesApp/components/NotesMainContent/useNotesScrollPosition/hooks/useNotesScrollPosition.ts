import { useRef } from 'react'

import { useNotesToc } from '@/components/NotesApp/NotesTocProvider'

import { useRestoreScrollPosition } from './useRestoreScrollPosition'
import { useSaveScrollPosition } from './useSaveScrollPosition'

/**
 * Remembers and restores the scroll position of the notes editor container for
 * the given note. Composes the restore (run-once, smooth) and save (debounced)
 * sub-hooks, sharing an `isRestoring` flag so programmatic scrolls aren't saved.
 */
export function useNotesScrollPosition(noteId: string): void {
  const { scrollContainerRef, editor } = useNotesToc()

  const isRestoringRef = useRef(false)

  useRestoreScrollPosition({ noteId, scrollContainerRef, editor, isRestoringRef })
  useSaveScrollPosition({ noteId, scrollContainerRef, isRestoringRef })
}
