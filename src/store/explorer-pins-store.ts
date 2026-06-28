import { create } from 'zustand'

/**
 * Frontend-only persistence for "pinned" repos shown above the Repositories
 * and Recent sections of the project explorer sidebar. Pins survive across
 * sessions via localStorage and are independent of the explorer history store
 * — removing a repo from history does NOT unpin it.
 *
 * The type below is declared structurally to match the shape consumed by the
 * explorer history store (which imports a phantom `preload/index.d` that
 * resolves to `any`). Keeping it local avoids adding another broken import.
 */
const STORAGE_KEY = 'genisys.explorer.pinnedRepos.v1'

interface ExplorerRepoEntry {
  source: string
  repository: string
  organization: string
  project: string
  localPath?: string
  lastOpenedAt: string
}

interface ExplorerPinsState {
  pinnedRepos: ExplorerRepoEntry[]
}

interface ExplorerPinsActions {
  togglePin: (entry: ExplorerRepoEntry) => void
  unpinByKey: (key: string) => void
}

function pinKey(repo: { localPath?: string }): string {
  return `local:${repo.localPath ?? ''}`
}

function loadFromStorage(): ExplorerRepoEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed as ExplorerRepoEntry[]
  } catch {
    return []
  }
}

function saveToStorage(repos: ExplorerRepoEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(repos))
  } catch {
    // Quota / private mode — silently ignore
  }
}

export const useExplorerPinsStore = create<ExplorerPinsState & ExplorerPinsActions>()(
  (set, get) => ({
    pinnedRepos: loadFromStorage(),

    togglePin: (entry) => {
      const key = pinKey(entry)
      const current = get().pinnedRepos
      const exists = current.some((r) => pinKey(r) === key)
      const next = exists
        ? current.filter((r) => pinKey(r) !== key)
        : [{ ...entry, lastOpenedAt: entry.lastOpenedAt ?? new Date().toISOString() }, ...current]
      set({ pinnedRepos: next })
      saveToStorage(next)
    },

    unpinByKey: (key) => {
      const next = get().pinnedRepos.filter((r) => pinKey(r) !== key)
      if (next.length === get().pinnedRepos.length) return
      set({ pinnedRepos: next })
      saveToStorage(next)
    },
  })
)

export { pinKey as explorerPinKey }
