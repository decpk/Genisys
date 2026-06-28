import { useState, useMemo, useRef, useEffect, Fragment } from 'react'
import { ChevronRight, Plus, FolderPlus, MoreVertical, Pencil, Trash2, Download } from 'lucide-react'
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
import { FolderItem } from './FolderItem'
import { RequestItem } from './RequestItem'
import { compareByField } from './useAPIClientSidebarData'
import type { ApiClientSortConfig } from './APIClientSortSwitcher'
import type { ApiCollection, ApiFolder, ApiRequestItem, HttpMethod } from '../../APIClient.types'

interface CollectionItemProps {
  collection: ApiCollection
  folders: ApiFolder[]
  requests: ApiRequestItem[]
  activeRequestId: string | null
  sort: ApiClientSortConfig
  onSelectRequest: (id: string) => void
  onAddRequest: (folderId?: string) => void
  onAddFolder: () => void
  onRemoveCollection: () => void
  onRemoveFolder: (id: string) => void
  onUpdateCollection: (id: string, updates: Partial<ApiCollection>) => Promise<void>
  onUpdateFolder: (id: string, updates: Partial<ApiFolder>) => Promise<void>
  onUpdateRequest: (id: string, updates: Partial<ApiRequestItem>) => Promise<void>
  onDuplicateRequest: (id: string) => void
  onExportCollection: (id: string) => void
  onExportRequest: (id: string) => void
  onViewAnalyticsRequest: (id: string) => void
  onDeleteRequest: (id: string) => void
}

export function CollectionItem(props: CollectionItemProps): React.JSX.Element {
  const {
    collection, folders, requests, activeRequestId, sort,
    onSelectRequest, onAddRequest, onAddFolder, onRemoveCollection, onRemoveFolder,
    onUpdateCollection, onUpdateFolder, onUpdateRequest, onDuplicateRequest, onExportCollection, onExportRequest, onViewAnalyticsRequest,
    onDeleteRequest,
  } = props
  const [expanded, setExpanded] = useState(true)
  const [isRenaming, setIsRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState(collection.name)
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
    if (trimmed && trimmed !== collection.name) {
      await onUpdateCollection(collection.id, { name: trimmed })
    }
    setIsRenaming(false)
  }

  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleRenameSubmit()
    if (e.key === 'Escape') {
      // Consume Escape so cancelling rename doesn't also exit native fullscreen.
      e.preventDefault()
      setRenameValue(collection.name)
      setIsRenaming(false)
    }
  }

  const sortedFolders = useMemo(() => {
    // Folders don't have 'method', fall back to 'name'
    const effectiveField = sort.field === 'method' ? 'name' : sort.field
    return [...folders].sort((a, b) => compareByField(a, b, effectiveField, sort.direction))
  }, [folders, sort.field, sort.direction])

  // Requests at collection root (no folder)
  const rootRequests = useMemo(
    () => requests.filter((r) => !r.folderId).sort((a, b) => compareByField(a, b, sort.field, sort.direction)),
    [requests, sort.field, sort.direction],
  )

  const colorDot = collection.color
    ? <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: collection.color }} />
    : null

  const dropdownItems = [
    {
      key: 'rename',
      label: 'Rename',
      icon: Pencil,
      onSelect: () => {
        setRenameValue(collection.name)
        setIsRenaming(true)
      },
    },
    {
      key: 'export',
      label: 'Export',
      icon: Download,
      onSelect: () => onExportCollection(collection.id),
    },
    {
      key: 'delete',
      label: 'Delete',
      icon: Trash2,
      destructive: true,
      onSelect: onRemoveCollection,
    },
  ]

  return (
    <div className="mb-1">
      <ContextMenu>
        <ContextMenuTrigger asChild disabled={isRenaming}>
          <div className="flex items-center gap-1 px-1.5 py-1.5 group hover:bg-muted/30 rounded-md">
            {isRenaming ? (
              <input
                ref={renameInputRef}
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onBlur={handleRenameSubmit}
                onKeyDown={handleRenameKeyDown}
                className="flex-1 text-xs font-medium bg-background border border-transparent rounded px-1.5 py-0.5 outline-none min-w-0 focus:border-input focus:ring-1 focus:ring-ring/20"
              />
            ) : (
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-1.5 flex-1 text-xs font-medium text-foreground min-w-0"
              >
                <ChevronRight
                  size={12}
                  className={cn('shrink-0 transition-transform text-muted-foreground', expanded && 'rotate-90')}
                />
                {colorDot}
                <span className="truncate">{collection.name}</span>
              </button>
            )}
            <div className="flex items-center opacity-0 group-hover:opacity-100">
              <IconButton size="xs" variant="ghost" onClick={() => onAddRequest()} tooltip="New Request">
                <Plus size={12} />
              </IconButton>
              <IconButton size="xs" variant="ghost" onClick={onAddFolder} tooltip="New Folder">
                <FolderPlus size={12} />
              </IconButton>
              <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <IconButton size="xs" variant="ghost" tooltip="More actions" tooltipDisabled={menuOpen}>
                    <MoreVertical size={12} />
                  </IconButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {dropdownItems.map((item) => {
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
          {dropdownItems.map((item) => {
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

      {expanded && (
        <div className="ml-3 border-l border-border/25 pl-1 space-y-0.5 mt-0.5">
          {/* Folders */}
          {sortedFolders.map((folder) => {
            const folderRequests = requests.filter((r) => r.folderId === folder.id)
            return (
              <FolderItem
                key={folder.id}
                folder={folder}
                requests={folderRequests}
                activeRequestId={activeRequestId}
                sort={sort}
                onSelectRequest={onSelectRequest}
                onAddRequest={(fid) => onAddRequest(fid)}
                onRemoveFolder={onRemoveFolder}
                onUpdateFolder={onUpdateFolder}
                onUpdateRequest={onUpdateRequest}
                onDuplicateRequest={onDuplicateRequest}
                onExportRequest={onExportRequest}
                onViewAnalyticsRequest={onViewAnalyticsRequest}
                onDeleteRequest={onDeleteRequest}
              />
            )
          })}

          {/* Root requests (no folder) */}
          {rootRequests.map((req) => (
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
