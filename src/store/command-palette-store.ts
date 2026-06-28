import { create } from 'zustand'

import { closeAction } from './command-palette-store/actions/closeAction'
import { openCommandsAction } from './command-palette-store/actions/openCommandsAction'
import { openQuickOpenAction } from './command-palette-store/actions/openQuickOpenAction'
import { setKindFilterAction } from './command-palette-store/actions/setKindFilterAction'
import { setQueryAction } from './command-palette-store/actions/setQueryAction'
import { setSelectedIndexAction } from './command-palette-store/actions/setSelectedIndexAction'
import type { CommandPaletteStore } from './command-palette-store/command-palette-store.types'

export const useCommandPaletteStore = create<CommandPaletteStore>()((set, get) => ({
  isOpen: false,
  initialMode: 'quick-open',
  mode: 'quick-open',
  kindFilter: null,
  query: '',
  cleanedQuery: '',
  selectedIndex: 0,

  openQuickOpen: () => openQuickOpenAction(set),
  openCommands: () => openCommandsAction(set),
  toggleQuickOpen: () => {
    if (get().isOpen) closeAction(set)
    else openQuickOpenAction(set)
  },
  toggleCommands: () => {
    if (get().isOpen) closeAction(set)
    else openCommandsAction(set)
  },
  close: () => closeAction(set),
  setQuery: (q) => setQueryAction(set, q),
  setSelectedIndex: (i) => setSelectedIndexAction(set, i),
  setKindFilter: (k) => setKindFilterAction(set, k),
}))

export type { CommandPaletteStore } from './command-palette-store/command-palette-store.types'
