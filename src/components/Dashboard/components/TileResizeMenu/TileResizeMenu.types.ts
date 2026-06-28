import type { TileWidth } from '@/store/dashboard-store'

export interface TileResizeMenuProps {
  /** Current tile width — drives which option shows the active check. */
  tileWidth: TileWidth
  /** Called with the chosen width when an option is selected. */
  onWidthChange: (width: TileWidth) => void
  /** Trigger icon size in px. Defaults to 14 (some headers use 13). */
  iconSize?: number
  /** Trigger tooltip label. Defaults to `Resize`. */
  tooltipLabel?: string
  /** Menu alignment relative to the trigger. Defaults to `end`. */
  align?: 'start' | 'center' | 'end'
}
