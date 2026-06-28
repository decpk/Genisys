import { create } from 'zustand'

export interface Snippet {
  id: string
  title: string
  content: string
  conversationId: string | null
  isFavorite: boolean
  createdAt: string
  updatedAt: string
}

interface SnippetsState {
  snippets: Snippet[]
  isLoaded: boolean
}

interface SnippetsActions {
  loadSnippets: () => Promise<void>
  addSnippet: (title: string, content: string, conversationId?: string | null) => Promise<void>
  updateSnippet: (id: string, updates: Partial<Pick<Snippet, 'title' | 'content'>>) => Promise<void>
  removeSnippet: (id: string) => Promise<void>
  toggleFavorite: (id: string) => Promise<void>
}

export const useSnippetsStore = create<SnippetsState & SnippetsActions>()((set, get) => ({
  snippets: [],
  isLoaded: false,

  loadSnippets: async () => {
    if (get().isLoaded) return
    try {
      const snippets = (await window.api.loadSnippets()) as Snippet[]
      console.log(`👍👍👍 ~ snippets-store.ts ~ loadSnippets => `, snippets)
      set({ snippets, isLoaded: true })
    } catch {
      set({ snippets: [], isLoaded: true })
    }
  },

  addSnippet: async (title, content, conversationId = null) => {
    const now = new Date().toISOString()
    const snippet: Snippet = {
      id: crypto.randomUUID(),
      title,
      content,
      conversationId,
      isFavorite: false,
      createdAt: now,
      updatedAt: now,
    }
    set((state) => ({ snippets: [snippet, ...state.snippets] }))
    await window.api.saveSnippet(snippet)
  },

  updateSnippet: async (id, updates) => {
    const snippet = get().snippets.find((s) => s.id === id)
    if (!snippet) return
    const updated = { ...snippet, ...updates, updatedAt: new Date().toISOString() }
    set((state) => ({
      snippets: state.snippets.map((s) => (s.id === id ? updated : s)),
    }))
    await window.api.saveSnippet(updated)
  },

  removeSnippet: async (id) => {
    set((state) => ({ snippets: state.snippets.filter((s) => s.id !== id) }))
    await window.api.removeSnippet(id)
  },

  toggleFavorite: async (id) => {
    set((state) => ({
      snippets: state.snippets.map((s) =>
        s.id === id ? { ...s, isFavorite: !s.isFavorite, updatedAt: new Date().toISOString() } : s
      ),
    }))
    await window.api.toggleSnippetFavorite(id)
  },
}))
