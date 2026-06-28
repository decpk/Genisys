import { create } from 'zustand'

// ── Types ────────────────────────────────────────────────────────────

export type TileWidth = 'full' | 'half' | 'third' | 'small' | 'fill'

export interface DashboardProject {
  id: string
  name: string
  repositoryUrl: string
  createdAt: string
  tileWidth: TileWidth
}

interface DashboardState {
  projects: DashboardProject[]
  isLoaded: boolean
}

interface DashboardActions {
  loadProjects: () => Promise<void>
  addProject: (project: Omit<DashboardProject, 'id' | 'createdAt' | 'tileWidth'>) => void
  updateProject: (id: string, updates: Partial<Omit<DashboardProject, 'id' | 'createdAt'>>) => void
  removeProject: (id: string) => void
  reorderProjects: (orderedIds: string[]) => void
  setTileWidth: (id: string, width: TileWidth) => void
}

// ── Helpers ──────────────────────────────────────────────────────────

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function persist(_projects: DashboardProject[]): void {
  // Dashboard projects are session-only (no backend persistence).
}

// ── Store ────────────────────────────────────────────────────────────

export const useDashboardStore = create<DashboardState & DashboardActions>()((set, get) => ({
  projects: [],
  isLoaded: false,

  loadProjects: async () => {
    if (get().isLoaded) return
    set({ projects: [], isLoaded: true })
  },

  addProject: (project) => {
    const newProject: DashboardProject = {
      ...project,
      id: generateId(),
      createdAt: new Date().toISOString(),
      tileWidth: 'half'
    }
    const updated = [...get().projects, newProject]
    set({ projects: updated })
    persist(updated)
  },

  updateProject: (id, updates) => {
    const updated = get().projects.map((p) => (p.id === id ? { ...p, ...updates } : p))
    set({ projects: updated })
    persist(updated)
  },

  removeProject: (id) => {
    const updated = get().projects.filter((p) => p.id !== id)
    set({ projects: updated })
    persist(updated)
  },

  reorderProjects: (orderedIds) => {
    const map = new Map(get().projects.map((p) => [p.id, p]))
    const updated = orderedIds.map((id) => map.get(id)!).filter(Boolean)
    set({ projects: updated })
    persist(updated)
  },

  setTileWidth: (id, width) => {
    const updated = get().projects.map((p) => (p.id === id ? { ...p, tileWidth: width } : p))
    set({ projects: updated })
    persist(updated)
  }
}))
