import { create } from 'zustand'
import type { ExplorerRepoEntry } from '../../../preload/index.d'

interface ExplorerHistoryState {
  repos: ExplorerRepoEntry[]
  hasMore: boolean
  isLoaded: boolean
}

interface ExplorerHistoryActions {
  loadHistory: () => Promise<void>
  loadMore: () => Promise<void>
  addRepo: (entry: ExplorerRepoEntry) => Promise<void>
  removeRepo: (entry: ExplorerRepoEntry) => Promise<void>
  clearAll: () => Promise<void>
}

export const useExplorerHistoryStore = create<ExplorerHistoryState & ExplorerHistoryActions>()(
  (set, get) => ({
    repos: [],
    hasMore: false,
    isLoaded: false,

    loadHistory: async () => {
      if (get().isLoaded) return
      try {
        const page = await window.api.loadExplorerHistory()
        set({ repos: page.items, hasMore: page.hasMore, isLoaded: true })
      } catch {
        set({ repos: [], hasMore: false, isLoaded: true })
      }
    },

    loadMore: async () => {
      const state = get()
      if (!state.hasMore) return
      const last = state.repos[state.repos.length - 1]
      if (!last) return
      try {
        const page = await window.api.loadExplorerHistory(last.lastOpenedAt)
        set((s) => ({
          repos: [...s.repos, ...page.items],
          hasMore: page.hasMore,
        }))
      } catch {
        // Silently fail
      }
    },

    addRepo: async (entry) => {
      set((state) => {
        const isSame = (r: ExplorerRepoEntry) =>
          r.repository === entry.repository &&
          r.organization === entry.organization &&
          r.project === entry.project &&
          (r.localPath ?? '') === (entry.localPath ?? '')

        const exists = state.repos.some(isSame)
        if (exists) {
          return { repos: state.repos }
        }
        return {
          repos: [
            { ...entry, lastOpenedAt: new Date().toISOString() },
            ...state.repos
          ]
        }
      })
      window.api.saveExplorerRepo(entry).catch(() => {})
    },

    removeRepo: async (entry) => {
      set((state) => ({
        repos: state.repos.filter((r) => !(
          entry.source === 'local'
            ? r.localPath === entry.localPath
            : (r.organization === entry.organization &&
               r.project === entry.project &&
               r.repository === entry.repository)
        ))
      }))
      window.api.removeExplorerRepo(entry).catch(() => {})
    },

    clearAll: async () => {
      try {
        await window.api.clearExplorerHistory()
        set({ repos: [], hasMore: false })
      } catch {
        // Silently fail
      }
    }
  })
)
