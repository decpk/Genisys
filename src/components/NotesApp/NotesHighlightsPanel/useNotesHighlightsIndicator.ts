import { useEffect } from 'react'

import type { PanelIndicator } from '@/frameworks/right-panel'
import { useNoteHighlightsStore } from '@/store/note-highlights-store'
import { useNotesAppStore } from '@/store/notes-app-store'

/**
 * Tab indicator for the Notes "Highlights" panel — surfaces the number of
 * saved highlights for the active note as a count badge on the tab trigger.
 *
 * Runs inside the tab trigger (even when the tab is inactive), so it eagerly
 * loads highlights for the selected note. `loadHighlights` is idempotent, so
 * calling it here in addition to the panel hook is safe.
 */
export function useNotesHighlightsIndicator(): PanelIndicator | null {
  const selectedNoteId = useNotesAppStore((s) => s.selectedNoteId)
  const loadHighlights = useNoteHighlightsStore((s) => s.loadHighlights)

  const count = useNoteHighlightsStore((s) =>
    selectedNoteId ? s.highlightsByNote[selectedNoteId]?.length ?? 0 : 0,
  )

  useEffect(() => {
    if (selectedNoteId) {
      void loadHighlights(selectedNoteId)
    }
  }, [selectedNoteId, loadHighlights])

  if (count <= 0) return null

  return { kind: 'count', count, tooltip: `${count} highlight${count === 1 ? '' : 's'}` }
}
