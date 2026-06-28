import type { PaletteKind, RecentEntry } from '@/components/CommandPalette/CommandPalette.types'

export interface CommandPaletteRecentsState {
  isLoaded: boolean
  recents: RecentEntry[]
}

export interface CommandPaletteRecentsActions {
  initRecents: () => Promise<void>
  markUsed: (id: string, kind: PaletteKind) => void
  getRecent: (kind?: PaletteKind) => RecentEntry[]
  clear: () => void
}

export type CommandPaletteRecentsStore = CommandPaletteRecentsState & CommandPaletteRecentsActions
