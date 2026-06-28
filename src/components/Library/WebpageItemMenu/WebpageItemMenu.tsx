import { MoreHorizontal, Pencil, Code, RefreshCw, Trash2 } from 'lucide-react'

import { IconButton } from '@/components/ui/icon-button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { isHtmlWebpage } from '@/store/utils/isHtmlWebpage'

import type { WebpageItemMenuProps } from './WebpageItemMenu.types'
import { STYLES } from './WebpageItemMenu.styles'

export function WebpageItemMenu(props: WebpageItemMenuProps): React.JSX.Element {
  const { webpage, onRename, onEdit, onRefresh, onDelete } = props

  const canEditContent = isHtmlWebpage(webpage)
  const canRefresh = !canEditContent

  const handleTriggerClick = (e: React.MouseEvent): void => {
    e.stopPropagation()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <IconButton
          variant="default"
          size="xs"
          showOnHover
          tooltip="More actions"
          tooltipSide="right"
          className="mt-0.5"
          onClick={handleTriggerClick}
        >
          <MoreHorizontal size={14} />
        </IconButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={6} className={STYLES.content}>
        <DropdownMenuItem onSelect={onRename} className={STYLES.item}>
          <Pencil size={14} />
          Rename
        </DropdownMenuItem>

        {canEditContent && (
          <DropdownMenuItem onSelect={onEdit} className={STYLES.item}>
            <Code size={14} />
            Edit content
          </DropdownMenuItem>
        )}

        {canRefresh && (
          <DropdownMenuItem onSelect={onRefresh} className={STYLES.item}>
            <RefreshCw size={14} />
            Refresh
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem onSelect={onDelete} className={STYLES.deleteItem}>
          <Trash2 size={14} />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
