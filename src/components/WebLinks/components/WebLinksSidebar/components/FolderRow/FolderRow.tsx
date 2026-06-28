import { Folder, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'

import { cn } from '@/lib/utils'
import { IconButton } from '@/components/ui/icon-button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

import { OpenUrlsInBrowserSubmenu } from '../../../OpenUrlsInBrowserSubmenu'
import { RenameFolderDialog } from '../RenameFolderDialog'
import { FolderRowContextMenu } from './components/FolderRowContextMenu'
import type { FolderRowActions, FolderRowProps } from './FolderRow.types'
import { STYLES } from './FolderRow.styles'
import { useFolderRowData } from './useFolderRowData'

/** A folder row with select-on-click plus rename / delete actions via a hover menu or right-click. */
export function FolderRow(props: FolderRowProps): React.JSX.Element {
  const { folder, count, isActive } = props
  const {
    menuOpen,
    setMenuOpen,
    renameOpen,
    onRenameOpenChange,
    onSelect,
    onRename,
    onDelete,
    onMenuTriggerClick,
    browsers,
    urlCount,
    onOpenAllUrls,
  } = useFolderRowData(folder)

  const rowClass = cn(STYLES.row, isActive && STYLES.rowActive)
  const countClass = cn(STYLES.count, menuOpen ? STYLES.countShifted : STYLES.countResting)

  let leadingEl: React.JSX.Element = <Folder size={15} className={STYLES.icon} />
  if (folder.color) {
    leadingEl = <span className={STYLES.colorDot} style={{ backgroundColor: folder.color }} />
  }

  const folderActions: FolderRowActions = {
    onRename,
    onDelete,
    onOpenAllUrls,
    browsers,
    urlCount,
  }

  const row = (
    <div className={rowClass} onClick={onSelect}>
      {leadingEl}
      <span className={STYLES.label}>{folder.name}</span>
      <span className={countClass}>{count}</span>

      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <IconButton
            type="button"
            size="xs"
            variant="ghost"
            tooltip="Folder actions"
            tooltipDisabled={menuOpen}
            className={STYLES.menuButton}
            onClick={onMenuTriggerClick}
          >
            <MoreHorizontal size={14} />
          </IconButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={onRename}>
            <Pencil />
            Rename
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <OpenUrlsInBrowserSubmenu
            browsers={browsers}
            disabled={urlCount === 0}
            onOpen={onOpenAllUrls}
          />
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive" onSelect={onDelete}>
            <Trash2 className="text-destructive" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <RenameFolderDialog folder={folder} open={renameOpen} onOpenChange={onRenameOpenChange} />
    </div>
  )

  return <FolderRowContextMenu actions={folderActions}>{row}</FolderRowContextMenu>
}
