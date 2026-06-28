import { create } from 'zustand'

export interface NoteSection {
  id: string
  notebookId: string
  name: string
  color: string | null
  icon: string | null
  emoji: string | null
  sortOrder: number
  createdAt: string
  updatedAt: string
}

interface NoteSectionsState {
  sections: NoteSection[]
  isLoaded: boolean
}

interface NoteSectionsActions {
  loadSections: () => Promise<void>
  addSection: (notebookId: string, name: string, color?: string) => Promise<NoteSection>
  updateSection: (section: NoteSection) => Promise<void>
  removeSection: (id: string) => Promise<void>
  reorderSections: (orderedIds: string[]) => Promise<void>
  moveSection: (sectionId: string, newNotebookId: string) => Promise<void>
  setSectionAppearance: (id: string, appearance: { color?: string | null; emoji?: string | null }) => Promise<void>
}

export const useNoteSectionsStore = create<NoteSectionsState & NoteSectionsActions>()(
  (set, get) => ({
    sections: [],
    isLoaded: false,

    loadSections: async () => {
      if (get().isLoaded) return
      try {
        const sections = (await window.api.loadNoteSections()) as NoteSection[]
        set({ sections, isLoaded: true })
      } catch {
        set({ sections: [], isLoaded: true })
      }
    },

    addSection: async (notebookId, name, color) => {
      const now = new Date().toISOString()
      const section: NoteSection = {
        id: crypto.randomUUID(),
        notebookId,
        name,
        color: color ?? null,
        icon: null,
        emoji: null,
        sortOrder: get().sections.filter((s) => s.notebookId === notebookId).length,
        createdAt: now,
        updatedAt: now,
      }
      set((s) => ({ sections: [...s.sections, section] }))
      window.api.saveNoteSection(section)
      return section
    },

    updateSection: async (section) => {
      const updated = { ...section, updatedAt: new Date().toISOString() }
      set((s) => ({
        sections: s.sections.map((sec) => (sec.id === updated.id ? updated : sec)),
      }))
      window.api.saveNoteSection(updated)
    },

    removeSection: async (id) => {
      set((s) => ({ sections: s.sections.filter((sec) => sec.id !== id) }))
      window.api.removeNoteSection(id)
    },

    reorderSections: async (orderedIds) => {
      set((s) => {
        const map = new Map(s.sections.map((sec) => [sec.id, sec]))
        const reordered = orderedIds
          .map((id, i) => {
            const sec = map.get(id)
            return sec ? { ...sec, sortOrder: i } : null
          })
          .filter(Boolean) as NoteSection[]
        // Keep sections not in orderedIds (from other notebooks)
        const otherSections = s.sections.filter((sec) => !orderedIds.includes(sec.id))
        return { sections: [...reordered, ...otherSections] }
      })
      window.api.reorderNoteSections(orderedIds)
    },

    moveSection: async (sectionId, newNotebookId) => {
      set((s) => ({
        sections: s.sections.map((sec) =>
          sec.id === sectionId ? { ...sec, notebookId: newNotebookId, updatedAt: new Date().toISOString() } : sec
        ),
      }))
      window.api.moveNoteSection(sectionId, newNotebookId)
    },

    setSectionAppearance: async (id, appearance) => {
      const existing = get().sections.find((s) => s.id === id)
      if (!existing) return
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
      const updated: NoteSection = {
        ...existing,
        color: nextColor,
        emoji: nextEmoji,
        updatedAt: new Date().toISOString(),
      }
      set((s) => ({ sections: s.sections.map((sec) => (sec.id === id ? updated : sec)) }))
      window.api.saveNoteSection(updated)
    },
  })
)
