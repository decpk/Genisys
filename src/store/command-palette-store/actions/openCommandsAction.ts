import type { CommandPaletteState } from '../command-palette-store.types'

type Setter = (partial: Partial<CommandPaletteState>) => void

export function openCommandsAction(set: Setter): void {
  set({
    isOpen: true,
    initialMode: 'commands',
    mode: 'commands',
    kindFilter: null,
    query: '',
    cleanedQuery: '',
    selectedIndex: 0,
  })
}
