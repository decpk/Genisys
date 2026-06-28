import {
  CalendarCheck,
  Timer,
  BookOpen,
  Clipboard,
  Sparkles,
  ScrollText,
  Newspaper,
  Activity,
  TrendingUp,
  Clock,
  Coffee,
} from 'lucide-react'

import {
  CLIPBOARD_QUICK_ACCESS_TILE_ID,
  CURRENTLY_READING_TILE_ID,
  KEEP_AWAKE_TILE_ID,
  TIME_CALENDAR_TILE_ID,
  TIMER_TILE_ID,
  QUICK_PROMPTS_TILE_ID,
  SNIPPETS_TILE_ID,
  TODAYS_AGENDA_TILE_ID,
} from '../../../registry/tile-ids.constants'
import { LIVE_SPORTS_VISIBILITY_KEY } from '../../../registry/visibility'

export interface TileVisibilityOption {
  /** Visibility map key — the value stored in `tileVisibility`. */
  key: string
  /** Human label for the dropdown row. */
  label: string
  /** Lucide icon shown next to the label. */
  icon: React.ComponentType<{ size: number; className?: string }>
}

/**
 * Singleton (and grouped) tiles exposed in the dashboard `+` popover for
 * show/hide toggling. Order matches the dashboard's default render order.
 *
 * News uses the runtime constant `NEWS_TILE_ID` from `news-tile-store`; we
 * inline the literal here to avoid pulling that store into the header bundle.
 */
export const TILE_VISIBILITY_OPTIONS: readonly TileVisibilityOption[] = [
  { key: TODAYS_AGENDA_TILE_ID, label: "Today's Agenda", icon: CalendarCheck },
  { key: TIME_CALENDAR_TILE_ID, label: 'Time & Calendar', icon: Clock },
  { key: TIMER_TILE_ID, label: 'Timer', icon: Timer },
  { key: KEEP_AWAKE_TILE_ID, label: 'Keep Awake', icon: Coffee },
  { key: CURRENTLY_READING_TILE_ID, label: 'Currently Reading', icon: BookOpen },
  { key: CLIPBOARD_QUICK_ACCESS_TILE_ID, label: 'Clipboard Quick Access', icon: Clipboard },
  { key: QUICK_PROMPTS_TILE_ID, label: 'Quick Prompts', icon: Sparkles },
  { key: '__news_tile__', label: 'News', icon: Newspaper },
  { key: '__stocks_tile__', label: 'Stocks', icon: TrendingUp },
  { key: LIVE_SPORTS_VISIBILITY_KEY, label: 'Live Sports', icon: Activity },
  { key: SNIPPETS_TILE_ID, label: 'Snippets', icon: ScrollText },
] as const
