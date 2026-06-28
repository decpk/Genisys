import type { CommandPaletteState } from '../command-palette-store.types'

type Setter = (partial: Partial<CommandPaletteState>) => void

export function openQuickOpenAction(set: Setter): void {
  set({
    isOpen: true,
    initialMode: 'quick-open',
    mode: 'quick-open',
    kindFilter: null,
    query: '',
    cleanedQuery: '',
    selectedIndex: 0,
  })
}
