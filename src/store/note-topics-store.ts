import { create } from 'zustand'

export interface NoteTopic {
  id: string
  sectionId: string
  name: string
  color: string | null
  icon: string | null
  emoji: string | null
  sortOrder: number
  createdAt: string
  updatedAt: string
}

interface NoteTopicsState {
  topics: NoteTopic[]
  isLoaded: boolean
}

interface NoteTopicsActions {
  loadTopics: () => Promise<void>
  addTopic: (sectionId: string, name: string, color?: string) => Promise<NoteTopic>
  updateTopic: (topic: NoteTopic) => Promise<void>
  removeTopic: (id: string) => Promise<void>
  reorderTopics: (orderedIds: string[]) => Promise<void>
  moveTopic: (topicId: string, newSectionId: string) => Promise<void>
  setTopicAppearance: (id: string, appearance: { color?: string | null; emoji?: string | null }) => Promise<void>
}

export const useNoteTopicsStore = create<NoteTopicsState & NoteTopicsActions>()(
  (set, get) => ({
    topics: [],
    isLoaded: false,

    loadTopics: async () => {
      if (get().isLoaded) return
      try {
        const topics = (await window.api.loadNoteTopics()) as NoteTopic[]
        set({ topics, isLoaded: true })
      } catch {
        set({ topics: [], isLoaded: true })
      }
    },

    addTopic: async (sectionId, name, color) => {
      const now = new Date().toISOString()
      const topic: NoteTopic = {
        id: crypto.randomUUID(),
        sectionId,
        name,
        color: color ?? null,
        icon: null,
        emoji: null,
        sortOrder: get().topics.filter((t) => t.sectionId === sectionId).length,
        createdAt: now,
        updatedAt: now,
      }
      set((s) => ({ topics: [...s.topics, topic] }))
      window.api.saveNoteTopic(topic)
      return topic
    },

    updateTopic: async (topic) => {
      const updated = { ...topic, updatedAt: new Date().toISOString() }
      set((s) => ({
        topics: s.topics.map((t) => (t.id === updated.id ? updated : t)),
      }))
      window.api.saveNoteTopic(updated)
    },

    removeTopic: async (id) => {
      set((s) => ({ topics: s.topics.filter((t) => t.id !== id) }))
      window.api.removeNoteTopic(id)
    },

    reorderTopics: async (orderedIds) => {
      set((s) => {
        const map = new Map(s.topics.map((t) => [t.id, t]))
        const reordered = orderedIds
          .map((id, i) => {
            const t = map.get(id)
            return t ? { ...t, sortOrder: i } : null
          })
          .filter(Boolean) as NoteTopic[]
        const otherTopics = s.topics.filter((t) => !orderedIds.includes(t.id))
        return { topics: [...reordered, ...otherTopics] }
      })
      window.api.reorderNoteTopics(orderedIds)
    },

    moveTopic: async (topicId, newSectionId) => {
      set((s) => ({
        topics: s.topics.map((t) =>
          t.id === topicId ? { ...t, sectionId: newSectionId, updatedAt: new Date().toISOString() } : t
        ),
      }))
      window.api.moveNoteTopic(topicId, newSectionId)
    },

    setTopicAppearance: async (id, appearance) => {
      const existing = get().topics.find((t) => t.id === id)
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
      const updated: NoteTopic = {
        ...existing,
        color: nextColor,
        emoji: nextEmoji,
        updatedAt: new Date().toISOString(),
      }
      set((s) => ({ topics: s.topics.map((t) => (t.id === id ? updated : t)) }))
      window.api.saveNoteTopic(updated)
    },
  })
)
