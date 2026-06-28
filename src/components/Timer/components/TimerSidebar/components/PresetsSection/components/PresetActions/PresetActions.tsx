import { Copy, MoreHorizontal, Pencil, Pin, PinOff, Trash2 } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import type { PresetActionsProps } from './PresetActions.types'

export function PresetActions(props: PresetActionsProps): React.JSX.Element {
  const { row, onAction } = props
  const PinIcon = row.isPinned ? PinOff : Pin
  const pinLabel = row.isPinned ? 'Unpin' : 'Pin to top'

  const stop = (e: React.MouseEvent | React.PointerEvent) => {
    e.stopPropagation()
  }

  const handleEdit = () => onAction({ type: 'edit', row })
  const handleDuplicate = () => onAction({ type: 'duplicate', row })
  const handleTogglePin = () => onAction({ type: 'togglePin', row })
  const handleDelete = () => onAction({ type: 'delete', row })

  const customItems = row.isCustom ? (
    <>
      <DropdownMenuItem onSelect={handleEdit}>
        <Pencil size={14} />
        Edit
      </DropdownMenuItem>
    </>
  ) : null

  const deleteItem = row.isCustom ? (
    <>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        onSelect={handleDelete}
        className="text-destructive focus:text-destructive"
      >
        <Trash2 size={14} />
        Delete
      </DropdownMenuItem>
    </>
  ) : null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Preset actions"
          onClick={stop}
          onPointerDown={stop}
          className="absolute top-1/2 right-1.5 -translate-y-1/2 flex size-5 items-center justify-center rounded text-muted-foreground opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:bg-muted hover:text-foreground transition-opacity"
        >
          <MoreHorizontal size={14} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" onClick={stop}>
        {customItems}
        <DropdownMenuItem onSelect={handleDuplicate}>
          <Copy size={14} />
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={handleTogglePin}>
          <PinIcon size={14} />
          {pinLabel}
        </DropdownMenuItem>
        {deleteItem}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
