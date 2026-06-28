import { useMemo } from 'react'

import { useSettingsStore } from '@/store/settings-store'

import {
  useClipboardQuickAccessTileEntry,
  useCurrentlyReadingTileEntry,
  useKeepAwakeTileEntry,
  useTimeCalendarTileEntry,
  useTimerTileEntry,
  useLiveSportsTileEntries,
  useNewsTileEntry,
  useQuickPromptsTileEntry,
  useSnippetsTileEntry,
  useStocksTileEntry,
  useTodaysAgendaTileEntry,
} from './builders'
import type {
  RegisteredTile,
  TileRegistry,
} from './TileRegistry.types'
import { sortRegistryByOrder } from './utils/sortRegistryByOrder'
import { filterAppEnabledTiles, filterVisibleTiles } from './visibility'

/**
 * Top-level dashboard tile registry.
 *
 * Composes one builder hook per tile *kind* (each self-contained, reading
 * from its own store). The combined list is sorted by the persisted
 * `useSettingsStore.tileOrder`, with any new tiles appended at the end.
 *
 * Adding a new tile kind = create a new builder hook + add one line here.
 */
export function useTileRegistry(): TileRegistry {
  const snippetsTile = useSnippetsTileEntry()
  const newsTile = useNewsTileEntry()
  const stocksTile = useStocksTileEntry()
  const sportTiles = useLiveSportsTileEntries()
  const todaysAgendaTile = useTodaysAgendaTileEntry()
  const currentlyReadingTile = useCurrentlyReadingTileEntry()
  const clipboardQuickAccessTile = useClipboardQuickAccessTileEntry()
  const quickPromptsTile = useQuickPromptsTileEntry()
  const timerTile = useTimerTileEntry()
  const keepAwakeTile = useKeepAwakeTileEntry()
  const timeCalendarTile = useTimeCalendarTileEntry()

  const tileOrder = useSettingsStore((s) => s.tileOrder)
  const tileVisibility = useSettingsStore((s) => s.tileVisibility)
  const enabledApps = useSettingsStore((s) => s.enabledApps)

  return useMemo<TileRegistry>(() => {
    const all: RegisteredTile[] = []
    // Default ordering when no `tileOrder` is saved:
    // todays-agenda → time-calendar → focus-timer → keep-awake → currently-reading → clipboard-quick-access → quick-prompts → projects → news → live-sports → snippets
    all.push(todaysAgendaTile)
    all.push(timeCalendarTile)
    all.push(timerTile)
    all.push(keepAwakeTile)
    all.push(currentlyReadingTile)
    all.push(clipboardQuickAccessTile)
    all.push(quickPromptsTile)
    if (newsTile) all.push(newsTile)
    if (stocksTile) all.push(stocksTile)
    all.push(...sportTiles)
    all.push(snippetsTile)

    const enabled = filterAppEnabledTiles(all, (app) => enabledApps.includes(app))
    const visible = filterVisibleTiles(enabled, tileVisibility)
    const sorted = sortRegistryByOrder(visible, tileOrder)

    return {
      tiles: sorted,
      sortableIds: sorted.map((t) => t.id),
    }
  }, [snippetsTile, newsTile, stocksTile, sportTiles, todaysAgendaTile, currentlyReadingTile, clipboardQuickAccessTile, quickPromptsTile, timerTile, keepAwakeTile, timeCalendarTile, tileOrder, tileVisibility, enabledApps])
}
