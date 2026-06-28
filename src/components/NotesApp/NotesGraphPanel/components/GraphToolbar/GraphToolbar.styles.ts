import { cn } from '@/lib/utils'

export const GRAPH_TOOLBAR_ROOT_CLASS =
  'flex items-center justify-between gap-2 border-b border-border/60 px-3 py-2'

export const GRAPH_TOOLBAR_GROUP_CLASS =
  'inline-flex items-center rounded-md border border-border/60 bg-muted/40 p-0.5'

export const GRAPH_TOOLBAR_COUNT_CLASS = 'text-xs tabular-nums text-muted-foreground'

export function graphToolbarButtonClass(active: boolean): string {
  return cn(
    'rounded px-2.5 py-1 text-xs font-medium transition-colors',
    active ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
  )
}
