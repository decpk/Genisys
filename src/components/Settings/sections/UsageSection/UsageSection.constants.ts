import type { UsageRangePreset, UsageRangeOption } from './UsageSection.types'

/** Ordered range presets shown in the RangeSelector segmented control. */
export const USAGE_RANGE_OPTIONS: ReadonlyArray<UsageRangeOption> = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This week' },
  { value: 'all', label: 'All time' },
]

/** Default preset on first open. */
export const DEFAULT_USAGE_PRESET: UsageRangePreset = 'week'

/** Number of apps to show in the per-app bar/pie charts before grouping. */
export const TOP_APP_COUNT = 8

/** Theme-aware chart palette (mirrors RechartsViewer). */
export const USAGE_CHART_PALETTE = [
  '#6366f1',
  '#22c55e',
  '#f59e0b',
  '#ec4899',
  '#06b6d4',
  '#a855f7',
  '#ef4444',
  '#14b8a6',
] as const

/** Fixed chart height for every ResponsiveContainer in this section. */
export const USAGE_CHART_HEIGHT = 220

export const USAGE_AXIS_TICK = {
  fontSize: 10,
  fill: 'var(--color-muted-foreground)',
} as const

export const USAGE_GRID_STROKE =
  'color-mix(in srgb, var(--color-border) 30%, transparent)'

export const USAGE_TOOLTIP_CONTENT_STYLE = {
  background: 'var(--color-popover)',
  border: '1px solid color-mix(in srgb, var(--color-border) 50%, transparent)',
  borderRadius: 10,
  color: 'var(--color-popover-foreground)',
  fontSize: 11,
} as const

export const USAGE_TOOLTIP_CURSOR = {
  fill: 'color-mix(in srgb, var(--color-primary) 8%, transparent)',
} as const

export const USAGE_AREA_COLOR = 'var(--color-primary)'
