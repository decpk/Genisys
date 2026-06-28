import type { CommandPaletteRecentsState } from '../command-palette-recents-store.types'
import { writeRecentsToDisk } from '../recentsPersistence'

type Setter = (partial: Partial<CommandPaletteRecentsState>) => void

export function clearAction(set: Setter): void {
  set({ recents: [] })
  void writeRecentsToDisk([])
}
