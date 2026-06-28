import type { PaletteKind, RecentEntry } from '@/components/CommandPalette/CommandPalette.types'

import type { CommandPaletteRecentsState } from '../command-palette-recents-store.types'

type Getter = () => CommandPaletteRecentsState

export function getRecentAction(get: Getter, kind?: PaletteKind): RecentEntry[] {
  const all = get().recents
  if (!kind) return all
  return all.filter((r) => r.kind === kind)
}
