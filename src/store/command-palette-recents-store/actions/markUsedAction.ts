import { RECENTS_MAX } from '@/components/CommandPalette/CommandPalette.constants'
import type { PaletteKind } from '@/components/CommandPalette/CommandPalette.types'

import type { CommandPaletteRecentsState } from '../command-palette-recents-store.types'
import { writeRecentsToDisk } from '../recentsPersistence'

type Getter = () => CommandPaletteRecentsState
type Setter = (partial: Partial<CommandPaletteRecentsState>) => void

export function markUsedAction(get: Getter, set: Setter, id: string, kind: PaletteKind): void {
  const current = get().recents
  const filtered = current.filter((r) => r.id !== id)
  const next = [{ id, kind, ts: Date.now() }, ...filtered].slice(0, RECENTS_MAX)
  set({ recents: next })
  void writeRecentsToDisk(next)
}
