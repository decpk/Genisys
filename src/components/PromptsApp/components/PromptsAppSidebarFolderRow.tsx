import { useCallback, type KeyboardEvent, type MouseEvent } from 'react'
import { MoreHorizontal, Pencil, Target, Trash2 } from 'lucide-react'

import { cn } from '@/lib/utils'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { getFolderAccent } from '../utils/folderAccent'
import type { PmFolder } from '@/store/prompt-manager-store'

// Mirrors the destructive-item recipe already wired into context-menu.tsx and
// dropdown-menu.tsx (see PmExplorerTree FolderNode for the canonical usage).
const DESTRUCTIVE_ITEM_CLASS = 'text-destructive'

interface PromptsAppSidebarFolderRowProps {
  folder: PmFolder
  isActive: boolean
  count: number
  onSelect: (id: string) => void
  onEdit: (folder: PmFolder) => void
  onDelete: (id: string) => void
}

export function PromptsAppSidebarFolderRow(
  props: PromptsAppSidebarFolderRowProps,
): React.JSX.Element {
  const { folder, isActive, count, onSelect, onEdit, onDelete } = props
  const accent = getFolderAccent(folder.color)
  const isBuiltIn = folder.isBuiltIn === true

  const handleSelect = useCallback(() => {
    onSelect(folder.id)
  }, [onSelect, folder.id])

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        handleSelect()
      }
    },
    [handleSelect],
  )

  const handleEdit = useCallback(() => {
    onEdit(folder)
  }, [onEdit, folder])

  const handleDelete = useCallback(() => {
    onDelete(folder.id)
  }, [onDelete, folder.id])

  // The kebab lives inside the row's click surface — stop bubbling so opening
  // the menu doesn't also select the collection.
  const stopRowActivation = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
  }, [])

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          role="button"
          tabIndex={0}
          onClick={handleSelect}
          onKeyDown={handleKeyDown}
          className={cn(
            'group/row relative flex w-full cursor-pointer select-none items-center gap-2.5 rounded-xl px-3 py-2 text-left transition-all border',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
            isActive
              ? 'bg-primary/10 border-primary/30 text-primary'
              : 'border-transparent text-foreground hover:bg-muted/40',
          )}
        >
          <span
            className={cn(
              'size-2 shrink-0 rounded-full ring-2',
              accent.dot,
              isActive ? 'ring-primary/30' : 'ring-background/40',
            )}
          />
          <span
            className={cn(
              'flex-1 truncate text-[13px] font-medium leading-tight',
              isActive ? 'text-primary' : 'text-foreground/90',
            )}
          >
            {folder.name}
          </span>

          {/* Count badge — fades out on hover/focus to clear room for the kebab. */}
          <span
            className={cn(
              'shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium tabular-nums transition-opacity',
              isActive
                ? 'bg-primary/15 text-primary'
                : 'bg-muted/60 text-muted-foreground',
              'group-hover/row:opacity-0 group-focus-within/row:opacity-0',
            )}
          >
            {count}
          </span>

          {/* Hover kebab — opens the same menu as the right-click context menu. */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label={`More actions for ${folder.name}`}
                onClick={stopRowActivation}
                className={cn(
                  'absolute right-2 grid size-6 cursor-pointer place-items-center rounded-md transition-opacity',
                  'opacity-0 group-hover/row:opacity-100 group-focus-within/row:opacity-100 data-[state=open]:opacity-100',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
                  isActive
                    ? 'text-primary-foreground/80 hover:bg-primary-foreground/15 hover:text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <MoreHorizontal size={14} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={4}>
              {isBuiltIn ? (
                <>
                  <DropdownMenuItem onClick={handleEdit}>
                    <Target /> Edit scopes…
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className={DESTRUCTIVE_ITEM_CLASS}
                    onClick={handleDelete}
                  >
                    <Trash2 /> Delete
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem onClick={handleEdit}>
                    <Pencil /> Rename
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className={DESTRUCTIVE_ITEM_CLASS}
                    onClick={handleDelete}
                  >
                    <Trash2 /> Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        {isBuiltIn ? (
          <>
            <ContextMenuItem onClick={handleEdit}>
              <Target /> Edit scopes…
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem
              className={DESTRUCTIVE_ITEM_CLASS}
              onClick={handleDelete}
            >
              <Trash2 /> Delete
            </ContextMenuItem>
          </>
        ) : (
          <>
            <ContextMenuItem onClick={handleEdit}>
              <Pencil /> Rename
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem
              className={DESTRUCTIVE_ITEM_CLASS}
              onClick={handleDelete}
            >
              <Trash2 /> Delete
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  )
}
