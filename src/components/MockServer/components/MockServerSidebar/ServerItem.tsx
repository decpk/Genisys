import { Play, Square, CopyPlus, Pencil, SlidersHorizontal, Trash2, MoreVertical } from 'lucide-react'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { IconButton } from '@/components/ui/icon-button'
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from '@/components/ui/context-menu'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { EditServerDialog } from '../EditServerDialog'
import type { ServerItemProps } from './ServerItem.types'
import { useServerItemData } from './useServerItemData'

export function ServerItem(props: ServerItemProps) {
  const { server, isSelected, isRunning } = props
  const {
    showEditDialog,
    setShowEditDialog,
    showDeleteConfirm,
    setShowDeleteConfirm,
    isRenaming,
    draftName,
    setDraftName,
    inputRef,
    dotClass,
    handleRowClick,
    handleStart,
    handleStop,
    handleDuplicate,
    handleStartRename,
    commitRename,
    handleRenameKeyDown,
    handleEditServer,
    handleRequestDelete,
    handleDeleteServer,
  } = useServerItemData(props)

  const [menuOpen, setMenuOpen] = useState(false)

  let nameContent = <span className="truncate flex-1">{server.name}</span>
  if (isRenaming) {
    nameContent = (
      <input
        ref={inputRef}
        type="text"
        value={draftName}
        onChange={(e) => setDraftName(e.target.value)}
        onKeyDown={handleRenameKeyDown}
        onBlur={commitRename}
        onClick={(e) => e.stopPropagation()}
        className="flex-1 h-5 border-0 bg-transparent px-0 text-xs font-medium text-foreground outline-none focus:ring-0"
        style={{ minWidth: '40px', width: `${Math.max(draftName.length, 6)}ch` }}
      />
    )
  }

  let toggleItem = (
    <ContextMenuItem onClick={handleStart}>
      <Play />
      Start Server
    </ContextMenuItem>
  )
  if (isRunning) {
    toggleItem = (
      <ContextMenuItem onClick={handleStop}>
        <Square />
        Stop Server
      </ContextMenuItem>
    )
  }

  let dropdownToggleItem = (
    <DropdownMenuItem onSelect={handleStart}>
      <Play />
      Start Server
    </DropdownMenuItem>
  )
  if (isRunning) {
    dropdownToggleItem = (
      <DropdownMenuItem onSelect={handleStop}>
        <Square />
        Stop Server
      </DropdownMenuItem>
    )
  }

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div
            role="button"
            tabIndex={0}
            className={cn(
              'group flex w-full items-center gap-2.5 px-2 py-2 rounded-md text-xs font-medium cursor-pointer text-left transition-colors',
              isSelected
                ? 'bg-primary/10 border border-primary/30 text-primary'
                : 'border border-transparent hover:bg-secondary/60 text-muted-foreground hover:text-foreground',
            )}
            onClick={handleRowClick}
          >
            <span className={dotClass} />
            {nameContent}
            <span className="text-[11px] text-muted-foreground/70 bg-muted/50 px-1.5 py-0.5 rounded">
              :{server.port}
            </span>
            <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
              <DropdownMenuTrigger asChild>
                <IconButton
                  size="xs"
                  variant="ghost"
                  tooltip="More actions"
                  tooltipDisabled={menuOpen}
                  className={cn(
                    'opacity-0 group-hover:opacity-100 transition-opacity',
                    menuOpen && 'opacity-100',
                  )}
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="size-3.5" />
                </IconButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {dropdownToggleItem}
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={handleDuplicate}>
                  <CopyPlus />
                  Duplicate Server
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={handleStartRename}>
                  <Pencil />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={handleEditServer}>
                  <SlidersHorizontal />
                  Edit Server
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={handleRequestDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="text-destructive" />
                  Delete Server
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          {toggleItem}
          <ContextMenuSeparator />
          <ContextMenuItem onClick={handleDuplicate}>
            <CopyPlus />
            Duplicate Server
          </ContextMenuItem>
          <ContextMenuItem onClick={handleStartRename}>
            <Pencil />
            Rename
          </ContextMenuItem>
          <ContextMenuItem onClick={handleEditServer}>
            <SlidersHorizontal />
            Edit Server
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem
            onClick={handleRequestDelete}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="text-destructive" />
            Delete Server
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <EditServerDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        server={server}
      />

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Server</AlertDialogTitle>
            <AlertDialogDescription>
              Delete <span className="font-medium">{server.name}</span>? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteServer}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
