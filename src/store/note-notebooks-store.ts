import { create } from 'zustand'
import { moveNotebookAction } from './note-notebooks-store/actions/moveNotebook'
import { setNotebookSortPreferenceAction } from './note-notebooks-store/actions/setNotebookSortPreference'
import type { NotesSidebarSort } from './notes-app-store'

export interface NoteNotebook {
  id: string
  name: string
  color: string | null
  icon: string | null
  emoji: string | null
  isSystem: boolean
  sortOrder: number
  projectId: string | null
  sortPreference: NotesSidebarSort | null
  createdAt: string
  updatedAt: string
}

interface NoteNotebooksState {
  notebooks: NoteNotebook[]
  isLoaded: boolean
}

interface NoteNotebooksActions {
  loadNotebooks: () => Promise<void>
  addNotebook: (
    name: string,
    color?: string,
    isSystem?: boolean,
    projectId?: string | null,
  ) => Promise<NoteNotebook>
  updateNotebook: (notebook: NoteNotebook) => Promise<void>
  removeNotebook: (id: string) => Promise<void>
  reorderNotebooks: (orderedIds: string[]) => Promise<void>
  setNotebookAppearance: (id: string, appearance: { color?: string | null; emoji?: string | null }) => Promise<void>
  moveNotebook: (notebookId: string, newProjectId: string | null) => Promise<void>
  setNotebookSortPreference: (id: string, sortPreference: NotesSidebarSort | null) => Promise<void>
}

export const useNoteNotebooksStore = create<NoteNotebooksState & NoteNotebooksActions>()(
  (set, get) => ({
    notebooks: [],
    isLoaded: false,

    loadNotebooks: async () => {
      if (get().isLoaded) return
      try {
        const notebooks = (await window.api.loadNoteNotebooks()) as NoteNotebook[]
        set({ notebooks, isLoaded: true })

        // Auto-create QuickNote if no system notebook exists
        const hasSystem = notebooks.some((n) => n.isSystem)
        if (!hasSystem) {
          const now = new Date().toISOString()
          const quicknote: NoteNotebook = {
            id: 'quicknote',
            name: 'QuickNote',
            color: '#3b82f6',
            icon: 'Zap',
            emoji: null,
            isSystem: true,
            sortOrder: 0,
            projectId: 'personal',
            sortPreference: null,
            createdAt: now,
            updatedAt: now,
          }
          await window.api.saveNoteNotebook(quicknote)
          set({ notebooks: [quicknote, ...notebooks] })
        }
      } catch {
        set({ notebooks: [], isLoaded: true })
      }
    },

    addNotebook: async (name, color, isSystem = false, projectId = null) => {
      const now = new Date().toISOString()
      const notebook: NoteNotebook = {
        id: crypto.randomUUID(),
        name,
        color: color ?? null,
        icon: null,
        emoji: null,
        isSystem,
        sortOrder: get().notebooks.length,
        projectId: projectId ?? null,
        sortPreference: null,
        createdAt: now,
        updatedAt: now,
      }
      set((s) => ({ notebooks: [...s.notebooks, notebook] }))
      window.api.saveNoteNotebook(notebook)
      return notebook
    },

    updateNotebook: async (notebook) => {
      // Guard: cannot rename system notebooks
      const existing = get().notebooks.find((n) => n.id === notebook.id)
      if (existing?.isSystem && existing.name !== notebook.name) return

      const updated = { ...notebook, updatedAt: new Date().toISOString() }
      set((s) => ({
        notebooks: s.notebooks.map((n) => (n.id === updated.id ? updated : n)),
      }))
      window.api.saveNoteNotebook(updated)
    },

    removeNotebook: async (id) => {
      // Guard: cannot delete system notebooks
      const notebook = get().notebooks.find((n) => n.id === id)
      if (notebook?.isSystem) return

      set((s) => ({ notebooks: s.notebooks.filter((n) => n.id !== id) }))
      window.api.removeNoteNotebook(id)
    },

    reorderNotebooks: async (orderedIds) => {
      set((s) => {
        const map = new Map(s.notebooks.map((n) => [n.id, n]))
        const reordered = orderedIds
          .map((id, i) => {
            const n = map.get(id)
            return n ? { ...n, sortOrder: i } : null
          })
          .filter(Boolean) as NoteNotebook[]
        return { notebooks: reordered }
      })
      window.api.reorderNoteNotebooks(orderedIds)
    },

    setNotebookAppearance: async (id, appearance) => {
      const existing = get().notebooks.find((n) => n.id === id)
      if (!existing) return
      // Mutual exclusion: setting one clears the other
      let nextColor = existing.color
      let nextEmoji = existing.emoji
      if ('emoji' in appearance) {
        nextEmoji = appearance.emoji ?? null
        if (nextEmoji) nextColor = null
      }
      if ('color' in appearance) {
        nextColor = appearance.color ?? null
        if (nextColor) nextEmoji = null
      }
      const updated: NoteNotebook = {
        ...existing,
        color: nextColor,
        emoji: nextEmoji,
        updatedAt: new Date().toISOString(),
      }
      set((s) => ({ notebooks: s.notebooks.map((n) => (n.id === id ? updated : n)) }))
      window.api.saveNoteNotebook(updated)
    },

    moveNotebook: (notebookId, newProjectId) => moveNotebookAction(get, set, notebookId, newProjectId),

    setNotebookSortPreference: (id, sortPreference) =>
      setNotebookSortPreferenceAction(get, set, id, sortPreference),
  })
)
