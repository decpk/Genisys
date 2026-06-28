import { parseQuery } from '@/components/CommandPalette/utils/parseQuery'

import type { CommandPaletteState } from '../command-palette-store.types'

type Setter = (
  partial:
    | Partial<CommandPaletteState>
    | ((state: CommandPaletteState) => Partial<CommandPaletteState>),
) => void

export function setQueryAction(set: Setter, query: string): void {
  set((state) => {
    const parsed = parseQuery(query, state.initialMode)
    return {
      query,
      cleanedQuery: parsed.cleanedQuery,
      mode: parsed.mode,
      kindFilter: parsed.kindFilter,
      selectedIndex: 0,
    }
  })
}
