import type { CommandPaletteState } from '../command-palette-store.types'

type Setter = (partial: Partial<CommandPaletteState>) => void

export function setSelectedIndexAction(set: Setter, index: number): void {
  set({ selectedIndex: Math.max(0, index) })
}
