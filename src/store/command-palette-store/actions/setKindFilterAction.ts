import type { PaletteKind } from '@/components/CommandPalette/CommandPalette.types'

import type { CommandPaletteState } from '../command-palette-store.types'

type Setter = (partial: Partial<CommandPaletteState>) => void

export function setKindFilterAction(set: Setter, kind: PaletteKind | null): void {
  set({ kindFilter: kind, selectedIndex: 0 })
}
