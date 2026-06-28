import type { AppView } from '@/components/ActivityBar'

import {
  CLIPBOARD_QUICK_ACCESS_TILE_ID,
  CURRENTLY_READING_TILE_ID,
  QUICK_PROMPTS_TILE_ID,
  SNIPPETS_TILE_ID,
  TIMER_TILE_ID,
  TODAYS_AGENDA_TILE_ID,
} from '../tile-ids.constants'

/**
 * Maps an *app-bound* singleton tile id to the installable app that owns it.
 *
 * A tile listed here is only shown on the dashboard while its owner app is
 * enabled (see `filterAppEnabledTiles`), and its show/hide toggle in the
 * dashboard header dropdown is disabled until the app is enabled.
 *
 * Tile ids NOT listed here are standalone dashboard widgets (news, stocks,
 * live-sports, keep-awake, time-calendar) or dashboard-native aggregates
 * (projects, my-weekly-prs) that do not belong to a single toggleable app and
 * are therefore always available.
 *
 * Each mapping mirrors the tile's own `TileHeading` `appId` / navigation
 * target. Keyed by tile id (not kind) so the header's tile-visibility dropdown
 * — whose option keys are tile ids — can reuse this same source of truth.
 */
export const TILE_ID_TO_APP: Record<string, AppView> = {
  [CLIPBOARD_QUICK_ACCESS_TILE_ID]: 'clipboard',
  [QUICK_PROMPTS_TILE_ID]: 'prompts',
  [CURRENTLY_READING_TILE_ID]: 'library',
  [TIMER_TILE_ID]: 'timer',
  [SNIPPETS_TILE_ID]: 'chat',
  [TODAYS_AGENDA_TILE_ID]: 'dailyplan',
}
