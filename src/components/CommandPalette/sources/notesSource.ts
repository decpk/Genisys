import { useNavigationStore } from '@/store/navigation-store'
import { useNoteNotebooksStore } from '@/store/note-notebooks-store'
import { useNoteSectionsStore } from '@/store/note-sections-store'
import { useNoteTopicsStore } from '@/store/note-topics-store'
import { useNotesAppStore } from '@/store/notes-app-store'
import { useNotesStore } from '@/store/notes-store'

import { safeRun } from '../utils/safeRun'
import type { PaletteItem, PaletteSource } from '../CommandPalette.types'

const NOTES_APP_ID = 'notes-app'

function buildBreadcrumb(notebookId: string | null, sectionId: string | null, topicId: string | null): string {
  const parts: string[] = []
  try {
    const notebooks = (useNoteNotebooksStore.getState() as { notebooks?: Array<{ id: string; name: string }> }).notebooks
    const sections = (useNoteSectionsStore.getState() as { sections?: Array<{ id: string; name: string }> }).sections
    const topics = (useNoteTopicsStore.getState() as { topics?: Array<{ id: string; name: string }> }).topics
    if (notebookId && notebooks) {
      const nb = notebooks.find((n) => n.id === notebookId)
      if (nb) parts.push(nb.name)
    }
    if (sectionId && sections) {
      const sec = sections.find((s) => s.id === sectionId)
      if (sec) parts.push(sec.name)
    }
    if (topicId && topics) {
      const t = topics.find((tp) => tp.id === topicId)
      if (t) parts.push(t.name)
    }
  } catch {
    /* ignore — breadcrumb is best-effort */
  }
  return parts.join(' › ')
}

export const notesSource: PaletteSource = {
  id: 'notes',
  kinds: ['note'],
  load: async () => {
    try {
      await useNotesStore.getState().loadNotes(NOTES_APP_ID, 'global', 'all')
    } catch {
      /* ignore */
    }
  },
  getItems(): PaletteItem[] {
    try {
      const state = useNotesStore.getState() as {
        notes?: Array<{
          id: string
          title: string
          notebookId: string | null
          sectionId: string | null
          topicId: string | null
          isTrashed?: boolean
        }>
      }
      const notes = state.notes ?? []
      return notes
        .filter((n) => !n.isTrashed)
        .map((note): PaletteItem => {
          const breadcrumb = buildBreadcrumb(note.notebookId, note.sectionId, note.topicId)
          const keywords = ['note', 'notebook']
          if (breadcrumb) keywords.push(...breadcrumb.split(' › '))
          return {
            id: `note:${note.id}`,
            kind: 'note',
            title: note.title || 'Untitled note',
            subtitle: breadcrumb || 'Notes',
            keywords,
            group: 'navigate',
            action: () =>
              safeRun(() => {
                useNavigationStore.getState().setActiveApp('notes')
                const appStore = useNotesAppStore.getState() as {
                  setSelectedNoteId?: (id: string) => void
                }
                appStore.setSelectedNoteId?.(note.id)
              }),
          }
        })
    } catch {
      return []
    }
  },
}
