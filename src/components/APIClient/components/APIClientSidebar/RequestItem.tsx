import { Fragment, useEffect, useRef, useState } from 'react'
import { MoreVertical, Download, Copy, Pencil, BarChart3, Trash2 } from 'lucide-react'
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
import { METHOD_SIDEBAR_PILL, METHOD_SHORT } from '../../APIClient.constants'
import type { HttpMethod } from '../../APIClient.types'

interface RequestItemProps {
  id: string
  name: string
  method: HttpMethod
  url?: string
  isActive: boolean
  onClick: () => void
  onRename?: (id: string, name: string) => Promise<void> | void
  onDuplicate?: (id: string) => void
  onExport?: (id: string) => void
  onViewAnalytics?: (id: string) => void
  onDelete?: (id: string) => void
}

function getUrlPath(url: string): string {
  try {
    const u = new URL(url)
    return u.pathname + u.search
  } catch {
    // If not a valid URL, just show the raw value truncated
    return url
  }
}

export function RequestItem(props: RequestItemProps): React.JSX.Element {
  const { id, name, method, url, isActive, onClick, onRename, onDuplicate, onExport, onViewAnalytics, onDelete } = props
  const [isRenaming, setIsRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState(name)
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
    if (trimmed && trimmed !== name) {
      await onRename?.(id, trimmed)
    } else if (!trimmed) {
      setRenameValue(name)
    }
    setIsRenaming(false)
  }

  const handleRenameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleRenameSubmit()
    if (e.key === 'Escape') {
      // Consume Escape so cancelling rename doesn't also exit native fullscreen.
      e.preventDefault()
      setRenameValue(name)
      setIsRenaming(false)
    }
  }

  const hasActions = Boolean(onRename || onDuplicate || onExport || onViewAnalytics || onDelete)

  const menuItems = [
    onRename && {
      key: 'rename',
      label: 'Rename',
      icon: Pencil,
      onSelect: () => {
        setRenameValue(name)
        setIsRenaming(true)
      },
    },
    onDuplicate && {
      key: 'duplicate',
      label: 'Duplicate',
      icon: Copy,
      onSelect: () => onDuplicate(id),
    },
    onExport && {
      key: 'export',
      label: 'Export',
      icon: Download,
      onSelect: () => onExport(id),
    },
    onViewAnalytics && {
      key: 'analytics',
      label: 'View Analytics',
      icon: BarChart3,
      onSelect: () => onViewAnalytics(id),
    },
    onDelete && {
      key: 'delete',
      label: 'Delete',
      icon: Trash2,
      destructive: true,
      onSelect: () => onDelete(id),
    },
  ].filter(Boolean) as Array<{ key: string; label: string; icon: typeof Pencil; onSelect: () => void; destructive?: boolean }>

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild disabled={isRenaming || !hasActions}>
        <div
          className={cn(
            'flex items-start gap-2 w-full px-2 py-1.5 text-xs rounded-md transition-all text-left group',
            isActive
              ? 'bg-primary/10 border border-primary/30 text-primary'
              : 'border border-transparent text-foreground/80 hover:bg-secondary'
          )}
        >
          <button onClick={onClick} className="flex items-start gap-2 flex-1 min-w-0 text-left" disabled={isRenaming}>
            <span className={cn(
              'inline-flex items-center justify-center px-1.5 py-0.5 rounded text-2xs font-bold uppercase shrink-0 mt-0.5 min-w-[32px]',
              METHOD_SIDEBAR_PILL[method]
            )}>
              {METHOD_SHORT[method]}
            </span>
            <div className="flex flex-col min-w-0 gap-0.5">
              {isRenaming ? (
                <input
                  ref={renameInputRef}
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onBlur={handleRenameSubmit}
                  onKeyDown={handleRenameKeyDown}
                  className="w-full text-xs font-medium bg-background border border-transparent rounded px-1.5 py-0.5 outline-none min-w-0 focus:border-input focus:ring-1 focus:ring-ring/20"
                />
              ) : (
                <span className="truncate font-medium">{name || 'Untitled'}</span>
              )}
              {url && (
                <span className="truncate text-2xs text-muted-foreground/40 font-sans">
                  {getUrlPath(url)}
                </span>
              )}
            </div>
          </button>
          {!isRenaming && hasActions && (
            <div className="flex items-center self-center shrink-0 opacity-0 group-hover:opacity-100">
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
          )}
        </div>
      </ContextMenuTrigger>
      {hasActions && (
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
      )}
    </ContextMenu>
  )
}
