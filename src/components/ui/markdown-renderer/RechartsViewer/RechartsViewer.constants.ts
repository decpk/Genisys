export const CHART_PALETTE = [
  '#6366f1',
  '#22c55e',
  '#f59e0b',
  '#ec4899',
  '#06b6d4',
  '#a855f7',
  '#ef4444',
  '#14b8a6',
] as const

export const CHART_HEIGHT = 260

export const AXIS_TICK = { fontSize: 10, fill: 'var(--color-muted-foreground)' } as const

export const GRID_STROKE = 'color-mix(in srgb, var(--color-border) 30%, transparent)'

export const TOOLTIP_CONTENT_STYLE = {
  background: 'var(--color-popover)',
  border: '1px solid color-mix(in srgb, var(--color-border) 50%, transparent)',
  borderRadius: 10,
  color: 'var(--color-popover-foreground)',
  fontSize: 11,
} as const

export const TOOLTIP_CURSOR = {
  fill: 'color-mix(in srgb, var(--color-primary) 8%, transparent)',
} as const

export const LEGEND_STYLE = { fontSize: 11, color: 'var(--color-muted-foreground)' } as const

export const PIE_NAME_KEY_DEFAULT = 'name'

export const PIE_VALUE_KEY_DEFAULT = 'value'
