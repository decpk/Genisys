import { Fragment, useState, useMemo, useRef, useEffect } from 'react'
import { ChevronRight, FolderOpen, Folder, Plus, MoreVertical, Pencil, Trash2 } from 'lucide-react'
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
} from '@/components/ui/dropdown-menu'
import { RequestItem } from './RequestItem'
import { compareByField } from './useAPIClientSidebarData'
import type { ApiClientSortConfig } from './APIClientSortSwitcher'
import type { ApiRequestItem, ApiFolder, HttpMethod } from '../../APIClient.types'

interface FolderItemProps {
  folder: ApiFolder
  requests: ApiRequestItem[]
  activeRequestId: string | null
  sort: ApiClientSortConfig
  onSelectRequest: (id: string) => void
  onAddRequest: (folderId: string) => void
  onRemoveFolder: (id: string) => void
  onUpdateFolder: (id: string, updates: Partial<ApiFolder>) => Promise<void>
  onUpdateRequest: (id: string, updates: Partial<ApiRequestItem>) => Promise<void>
  onDuplicateRequest: (id: string) => void
  onExportRequest: (id: string) => void
  onViewAnalyticsRequest: (id: string) => void
  onDeleteRequest: (id: string) => void
}

export function FolderItem(props: FolderItemProps): React.JSX.Element {
  const {
    folder,
    requests,
    activeRequestId,
    sort,
    onSelectRequest,
    onAddRequest,
    onRemoveFolder,
    onUpdateFolder,
    onUpdateRequest,
    onDuplicateRequest,
    onExportRequest,
    onViewAnalyticsRequest,
    onDeleteRequest,
  } = props
  const [expanded, setExpanded] = useState(true)
  const [isRenaming, setIsRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState(folder.name)
  const [menuOpen, setMenuOpen] = useState(false)
  const renameInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isRenaming) {
      renameInputRef.current?.focus()
      renameInputRef.current?.select()
    }
  }, [isRenaming])

  const handleRenameSubmit = async () => {
    const trimmed = renameValue.trim()
    if (trimmed && trimmed !== folder.name) {
      await onUpdateFolder(folder.id, { name: trimmed })
    }
    setIsRenaming(false)
  }

  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleRenameSubmit()
    if (e.key === 'Escape') {
      // Consume Escape so cancelling rename doesn't also exit native fullscreen.
      e.preventDefault()
      setRenameValue(folder.name)
      setIsRenaming(false)
    }
  }

  const sortedRequests = useMemo(
    () => [...requests].sort((a, b) => compareByField(a, b, sort.field, sort.direction)),
    [requests, sort.field, sort.direction],
  )

  const FolderIcon = expanded ? FolderOpen : Folder

  const menuItems = [
    {
      key: 'rename',
      label: 'Rename',
      icon: Pencil,
      onSelect: () => {
        setRenameValue(folder.name)
        setIsRenaming(true)
      },
    },
    {
      key: 'delete',
      label: 'Delete',
      icon: Trash2,
      destructive: true,
      onSelect: () => onRemoveFolder(folder.id),
    },
  ]

  return (
    <div>
      <ContextMenu>
        <ContextMenuTrigger asChild disabled={isRenaming}>
          <div className="flex items-center gap-1 px-1 py-1 group hover:bg-muted/30 rounded-md">
            {isRenaming ? (
              <>
                <ChevronRight
                  size={12}
                  className={cn('shrink-0 transition-transform text-muted-foreground', expanded && 'rotate-90')}
                />
                <FolderIcon size={13} className="shrink-0 text-muted-foreground" />
                <input
                  ref={renameInputRef}
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onBlur={handleRenameSubmit}
                  onKeyDown={handleRenameKeyDown}
                  className="flex-1 text-xs bg-background border border-transparent rounded px-1.5 py-0.5 outline-none min-w-0 focus:border-input focus:ring-1 focus:ring-ring/20"
                />
              </>
            ) : (
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-1.5 flex-1 text-xs text-foreground/80 min-w-0"
              >
                <ChevronRight
                  size={12}
                  className={cn('shrink-0 transition-transform text-muted-foreground', expanded && 'rotate-90')}
                />
                <FolderIcon size={13} className="shrink-0 text-muted-foreground" />
                <span className="truncate">{folder.name}</span>
                <span className="text-2xs text-muted-foreground ml-0.5">{requests.length}</span>
              </button>
            )}
            <div className="flex items-center opacity-0 group-hover:opacity-100">
              <IconButton size="xs" variant="ghost" onClick={() => onAddRequest(folder.id)} tooltip="New Request">
                <Plus size={12} />
              </IconButton>
              <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <IconButton size="xs" variant="ghost" tooltip="More actions" tooltipDisabled={menuOpen}>
                    <MoreVertical size={12} />
                  </IconButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {menuItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <DropdownMenuItem
                        key={item.key}
                        onSelect={item.onSelect}
                        className={cn(item.destructive && 'text-destructive focus:text-destructive')}
                      >
                        <Icon className={cn(item.destructive && 'text-destructive')} />
                        {item.label}
                      </DropdownMenuItem>
                    )
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <Fragment key={item.key}>
                {item.destructive && <ContextMenuSeparator />}
                <ContextMenuItem
                  onClick={item.onSelect}
                  className={cn(item.destructive && 'text-destructive focus:text-destructive')}
                >
                  <Icon className={cn(item.destructive && 'text-destructive')} />
                  {item.label}
                </ContextMenuItem>
              </Fragment>
            )
          })}
        </ContextMenuContent>
      </ContextMenu>
      {expanded && sortedRequests.length > 0 && (
        <div className="ml-3 border-l border-border/25 pl-1 space-y-0.5 mt-0.5">
          {sortedRequests.map((req) => (
            <RequestItem
              key={req.id}
              id={req.id}
              name={req.name}
              method={req.method as HttpMethod}
              url={req.url}
              isActive={activeRequestId === req.id}
              onClick={() => onSelectRequest(req.id)}
              onRename={(id, nextName) => onUpdateRequest(id, { name: nextName })}
              onDuplicate={onDuplicateRequest}
              onExport={onExportRequest}
              onViewAnalytics={onViewAnalyticsRequest}
              onDelete={onDeleteRequest}
            />
          ))}
        </div>
      )}
    </div>
  )
}
