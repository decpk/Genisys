import type { CommandPaletteState } from '../command-palette-store.types'

type Setter = (partial: Partial<CommandPaletteState>) => void

export function closeAction(set: Setter): void {
  set({
    isOpen: false,
    query: '',
    cleanedQuery: '',
    kindFilter: null,
    selectedIndex: 0,
  })
}
