import type { TileWidth } from '@/store/dashboard-store'

/**
 * The dashboard's reference design grid. Tile widths (`full`/`half`/`third`/
 * `small`) are authored against this 6-column model and are scaled down
 * proportionally when the grid renders fewer columns at narrow widths.
 */
const MAX_COLS = 6

const BASE_SPAN: Record<Exclude<TileWidth, 'fill'>, number> = {
  full: 6,
  half: 3,
  third: 2,
  small: 1
}

/**
 * Literal `col-span-*` classes. These MUST be written out in full so Tailwind's
 * JIT scanner emits them — dynamically interpolated class names (e.g.
 * `col-span-${n}`) are purged from the build, which silently collapses the tile
 * to a single column.
 */
const COL_SPAN_CLASS: Record<number, string> = {
  1: 'col-span-1',
  2: 'col-span-2',
  3: 'col-span-3',
  4: 'col-span-4',
  5: 'col-span-5',
  6: 'col-span-6'
}

/**
 * Literal `grid-cols-*` classes for each supported column count. Written out in
 * full for the same Tailwind JIT reason as {@link COL_SPAN_CLASS}.
 */
const GRID_COLS_CLASS: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  4: 'grid-cols-4',
  6: 'grid-cols-6'
}

/**
 * Width breakpoints (in px, measured against the grid element's own
 * `clientWidth`) mapped to the number of columns the grid should render. Kept
 * coarse so a single tile column never collapses to an unreadable sliver.
 *
 * At >= 1200px the grid renders the full 6 columns, so the layout is identical
 * to the original fixed design — narrower widths progressively reflow.
 */
const WIDTH_BREAKPOINTS: ReadonlyArray<{ minWidth: number; cols: number }> = [
  { minWidth: 1600, cols: 6 },
  { minWidth: 1200, cols: 4 },
  { minWidth: 900, cols: 2 },
  { minWidth: 0, cols: 2 },
];

/** Resolve how many columns the grid should render for a given pixel width. */
export function columnsForWidth(width: number): number {
  for (const bp of WIDTH_BREAKPOINTS) {
    if (width >= bp.minWidth) return bp.cols
  }
  return MAX_COLS
}

/** Literal `grid-cols-*` class for a given column count (falls back to 6). */
export function gridColsClass(cols: number): string {
  return GRID_COLS_CLASS[cols] ?? GRID_COLS_CLASS[MAX_COLS]
}

/**
 * Scale a tile's reference (6-column) span down to the active column count,
 * preserving its relative proportion and clamping into a valid 1..cols range.
 */
function scaleSpan(refSpan: number, cols: number): number {
  const scaled = Math.round((refSpan / MAX_COLS) * cols)
  return Math.min(cols, Math.max(1, scaled))
}

/**
 * Computes the `col-span-*` Tailwind class for each tile in render order.
 *
 * The dashboard uses an auto-flow grid whose column count (`cols`) adapts to the
 * available width. Tile widths are authored against a 6-column reference and
 * scaled proportionally to `cols`. A tile with width `'fill'` stretches to
 * occupy whatever columns remain on its current row (and becomes full width when
 * it starts a fresh row). Because CSS alone cannot reliably express "fill the
 * rest of the row" in a fixed-column grid, the span is computed here by
 * mirroring the grid's row-wrapping behaviour.
 *
 * `cols` defaults to {@link MAX_COLS} so existing callers keep the original
 * 6-column behaviour unchanged.
 */
export function resolveTileColSpans(
  tiles: ReadonlyArray<{ id: string; width: TileWidth }>,
  cols: number = MAX_COLS
): Record<string, string> {
  const result: Record<string, string> = {}
  let pos = 0 // columns already occupied in the current row (0..cols-1)

  for (const tile of tiles) {
    let span: number

    if (tile.width === 'fill') {
      // Fill the remaining columns; a fresh row (pos === 0) means full width.
      span = pos === 0 ? cols : cols - pos
    } else {
      // Guard against an unknown/undefined width: default to half so a missing
      // value can never produce `NaN` and poison subsequent `fill` tiles.
      const refSpan = BASE_SPAN[tile.width] ?? BASE_SPAN.half
      span = scaleSpan(refSpan, cols)
      // The grid wraps a tile to the next row when it doesn't fit, leaving a
      // gap. Mirror that so subsequent `fill` tiles measure from the new row.
      if (pos + span > cols) pos = 0
    }

    // Clamp into the valid 1..cols range so the lookup always resolves to a real
    // Tailwind class (never `undefined`).
    span = Math.min(cols, Math.max(1, span))
    result[tile.id] = COL_SPAN_CLASS[span]

    pos += span
    if (pos >= cols) pos = 0
  }

  return result
}
