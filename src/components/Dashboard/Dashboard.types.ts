import type { TileWidth } from '@/store/dashboard-store'

export const TILE_WIDTH_COLS: Record<TileWidth, string> = {
  full: 'col-span-6',
  half: 'col-span-3',
  third: 'col-span-2',
  small: 'col-span-1',
  // `fill` stretches to the remaining columns on the row; the actual span is
  // computed at render time (see resolveTileColSpans). This is the fallback
  // used when no row context is available.
  fill: 'col-span-6'
}

export const TILE_WIDTH_LABELS: Record<TileWidth, string> = {
  full: '1',
  half: '½',
  third: '⅓',
  small: '⅙',
  fill: '↔'
}
