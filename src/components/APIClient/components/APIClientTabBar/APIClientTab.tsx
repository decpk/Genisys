import { useCallback } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import { cn } from '@/lib/utils'
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from '@/components/ui/context-menu'
import { METHOD_COLORS, METHOD_SHORT } from '../../APIClient.constants'
import { APIClientTabIndicator } from './APIClientTabIndicator'
import type { APIClientTabProps } from './APIClientTab.types'

export function APIClientTab(props: APIClientTabProps) {
  const {
    request,
    isActive,
    isDirty,
    isSending,
    isDragging,
    onActivate,
    onClose,
    onCloseOthers,
    onCloseAll,
  } = props

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: request.id })

  const handleActivate = useCallback(() => onActivate(request.id), [onActivate, request.id])
  const handleClose = useCallback(() => onClose(request.id), [onClose, request.id])
  const handleAuxClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 1) {
        e.preventDefault()
        onClose(request.id)
      }
    },
    [onClose, request.id],
  )

  // While this tab is the one being dragged, suppress its own transform and
  // fade it into a placeholder — the floating DragOverlay ghost is what the
  // user sees following the cursor, and the gap marks the drop target.
  const style: React.CSSProperties = {
    transform: isDragging ? undefined : CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
  }

  const tabCls = cn(
    'group/tab relative flex h-9 shrink-0 cursor-pointer select-none items-center gap-1.5 border-r border-border/40 pl-3 pr-2 text-xs transition-colors',
    isDragging && 'bg-primary/5',
    isActive
      ? 'bg-background text-foreground'
      : 'bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground',
  )

  const methodCls = cn(
    'shrink-0 text-[10px] font-semibold uppercase tracking-wide',
    METHOD_COLORS[request.method],
  )

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          ref={setNodeRef}
          style={style}
          className={tabCls}
          onClick={handleActivate}
          onAuxClick={handleAuxClick}
          {...attributes}
          {...listeners}
        >
          {isActive && (
            <span className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-primary" />
          )}
          <span className={methodCls}>{METHOD_SHORT[request.method]}</span>
          <span className="max-w-[140px] truncate text-[11px]">{request.name}</span>
          <APIClientTabIndicator
            isActive={isActive}
            isDirty={isDirty}
            isSending={isSending}
            onClose={handleClose}
          />
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={() => onClose(request.id)}>Close</ContextMenuItem>
        <ContextMenuItem onClick={() => onCloseOthers(request.id)}>
          Close Others
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={() => onCloseAll()}>Close All</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
