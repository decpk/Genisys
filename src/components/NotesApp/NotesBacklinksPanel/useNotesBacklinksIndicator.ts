import { useNotesLinkGraph } from '@/components/NotesApp/notes-links'
import type { PanelIndicator } from '@/frameworks/right-panel'
import { useNotesAppStore } from '@/store/notes-app-store'

/**
 * Tab indicator for the Notes "Backlinks" panel — surfaces the number of notes
 * that link to the active note as a count badge on the tab trigger.
 */
export function useNotesBacklinksIndicator(): PanelIndicator | null {
  const selectedNoteId = useNotesAppStore((s) => s.selectedNoteId)
  const graph = useNotesLinkGraph()

  const count = selectedNoteId ? graph.backward[selectedNoteId]?.length ?? 0 : 0

  if (count <= 0) return null

  return { kind: 'count', count, tooltip: `${count} backlink${count === 1 ? '' : 's'}` }
}
