import { create } from 'zustand'

import { clearAction } from './command-palette-recents-store/actions/clearAction'
import { getRecentAction } from './command-palette-recents-store/actions/getRecentAction'
import { initRecentsAction } from './command-palette-recents-store/actions/initRecentsAction'
import { markUsedAction } from './command-palette-recents-store/actions/markUsedAction'
import type { CommandPaletteRecentsStore } from './command-palette-recents-store/command-palette-recents-store.types'

export const useCommandPaletteRecentsStore = create<CommandPaletteRecentsStore>()((set, get) => ({
  isLoaded: false,
  recents: [],

  initRecents: () => initRecentsAction(set),
  markUsed: (id, kind) => markUsedAction(get, set, id, kind),
  getRecent: (kind) => getRecentAction(get, kind),
  clear: () => clearAction(set),
}))

export type { CommandPaletteRecentsStore } from './command-palette-recents-store/command-palette-recents-store.types'
