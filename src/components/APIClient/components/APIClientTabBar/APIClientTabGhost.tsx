import { cn } from '@/lib/utils'
import { METHOD_COLORS, METHOD_SHORT } from '../../APIClient.constants'
import type { APIClientTabGhostProps } from './APIClientTabGhost.types'

/**
 * Floating representation of a tab while it is being dragged. Rendered inside
 * the DndContext's DragOverlay so it follows the cursor with a clear shadow,
 * instead of the original tab just dimming in place.
 */
export function APIClientTabGhost(props: APIClientTabGhostProps) {
  const { request } = props

  const methodCls = cn(
    'shrink-0 text-[10px] font-semibold uppercase tracking-wide',
    METHOD_COLORS[request.method],
  )

  return (
    <div className="flex h-9 cursor-grabbing items-center gap-1.5 rounded-md border border-border bg-background px-3 text-xs text-foreground shadow-lg">
      <span className={methodCls}>{METHOD_SHORT[request.method]}</span>
      <span className="max-w-[140px] truncate text-[11px]">{request.name}</span>
    </div>
  )
}
