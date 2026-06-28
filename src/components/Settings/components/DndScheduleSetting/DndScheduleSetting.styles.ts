/**
 * Tailwind class constants for `DndScheduleSetting`. Mirrors the
 * structure used by `AutoThemeScheduleSetting.styles.ts` for visual
 * consistency between the two scheduling controls.
 */
export const STYLES = {
  container: 'space-y-3',
  headerRow: 'flex items-center justify-between',
  rangeList: 'space-y-1.5',
  addButton:
    'w-full h-9 text-xs gap-1.5 border-dashed text-muted-foreground hover:text-foreground',
  statusBadge:
    'inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium',
  statusActive: 'bg-warning/10 text-warning',
  statusInactive: 'bg-muted/40 text-muted-foreground',
  emptyHint: 'text-[11px] text-muted-foreground/60 italic px-1',
} as const
