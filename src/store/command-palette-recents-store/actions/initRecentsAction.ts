import { readRecentsFromDisk } from '../recentsPersistence'
import type { CommandPaletteRecentsState } from '../command-palette-recents-store.types'

type Setter = (partial: Partial<CommandPaletteRecentsState>) => void

export async function initRecentsAction(set: Setter): Promise<void> {
  const recents = await readRecentsFromDisk()
  set({ isLoaded: true, recents })
}
