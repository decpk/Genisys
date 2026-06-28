import { useState, useMemo, useCallback } from 'react'
import { Trash2, Sparkles, CopyPlus, Power, Pencil, Link } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Tooltip } from '@/components/Tooltip'
import { useMockServerStore } from '@/store/mock-server-store'
import type { MockEndpoint } from '@/components/MockServer/MockServer.types'
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
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from '@/components/ui/context-menu'

const METHOD_COLORS: Record<string, string> = {
  GET: 'bg-emerald-500/15 text-emerald-500',
  POST: 'bg-blue-500/15 text-blue-500',
  PUT: 'bg-amber-500/15 text-amber-500',
  PATCH: 'bg-yellow-500/15 text-yellow-500',
  DELETE: 'bg-red-500/15 text-red-500',
  OPTIONS: 'bg-purple-500/15 text-purple-500',
  HEAD: 'bg-gray-500/15 text-gray-400',
}

interface EndpointItemProps {
  endpoint: MockEndpoint
  isSelected: boolean
  onSelect: (id: string) => void
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
  onToggleActive: (endpoint: MockEndpoint) => void
}

export function EndpointItem(props: EndpointItemProps) {
  const { endpoint, isSelected, onSelect, onDelete, onDuplicate, onToggleActive } = props
  const [isHovered, setIsHovered] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const servers = useMockServerStore((s) => s.servers)
  const server = useMemo(
    () => servers.find((s) => s.id === endpoint.server_id) ?? null,
    [servers, endpoint.server_id]
  )
  const fullUrl = `http://localhost:${server?.port ?? 3000}${endpoint.path}`

  const handleCopyUrl = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation()
    navigator.clipboard.writeText(fullUrl)
  }, [fullUrl])

  const methodColor = METHOD_COLORS[endpoint.method] ?? 'bg-gray-500/15 text-gray-400'

  const isAi = endpoint.response_type === 'ai'
  const responseTypeBadge = isAi ? (
    <span className="inline-flex items-center gap-1 rounded-md bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-medium text-indigo-400">
      <Sparkles className="h-2.5 w-2.5" />
      AI
    </span>
  ) : (
    <span className="rounded-md bg-muted/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
      Static
    </span>
  )

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div
            onClick={() => onSelect(endpoint.id)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={cn(
              "group flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-all cursor-pointer",
              isSelected
                ? "bg-primary/10 border border-primary/30 text-primary"
                : "border border-transparent text-foreground/80 hover:bg-secondary",
              !endpoint.is_active && "opacity-40",
            )}
          >
            <span
              className={cn(
                "shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                methodColor,
              )}
            >
              {endpoint.method}
            </span>

            <span className="min-w-0 flex-1 truncate text-xs">
              {endpoint.path}
            </span>

            <span
              className={cn(
                "shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-medium",
                endpoint.status_code >= 200 && endpoint.status_code < 300
                  ? "bg-emerald-500/10 text-emerald-500"
                  : endpoint.status_code >= 400
                    ? "bg-red-500/10 text-red-500"
                    : "bg-muted text-muted-foreground",
              )}
            >
              {endpoint.status_code}
            </span>

            {responseTypeBadge}

            {isHovered && (
              <div className="flex items-center gap-0.5 shrink-0">
                <Tooltip
                  content={endpoint.is_active ? "Disable" : "Enable"}
                  side="top"
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleActive(endpoint);
                    }}
                    className={cn(
                      "rounded-md p-1 transition-colors",
                      endpoint.is_active
                        ? "text-muted-foreground hover:bg-muted hover:text-foreground"
                        : "text-emerald-500 hover:bg-emerald-500/15",
                    )}
                  >
                    <Power className="h-3 w-3" />
                  </button>
                </Tooltip>
                <Tooltip content="Copy URL" side="top">
                  <button
                    onClick={handleCopyUrl}
                    className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <Link className="h-3 w-3" />
                  </button>
                </Tooltip>
                <Tooltip content="Duplicate" side="top">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicate(endpoint.id);
                    }}
                    className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <CopyPlus className="h-3 w-3" />
                  </button>
                </Tooltip>
                <Tooltip content="Delete" side="top">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteConfirm(true);
                    }}
                    className="rounded-md p-1 text-muted-foreground hover:bg-red-500/15 hover:text-red-500"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </Tooltip>
              </div>
            )}
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={() => onSelect(endpoint.id)}>
            <Pencil />
            Edit
          </ContextMenuItem>
          <ContextMenuItem onClick={() => handleCopyUrl()}>
            <Link />
            Copy URL
          </ContextMenuItem>
          <ContextMenuItem onClick={() => onDuplicate(endpoint.id)}>
            <CopyPlus />
            Duplicate
          </ContextMenuItem>
          <ContextMenuItem onClick={() => onToggleActive(endpoint)}>
            <Power />
            {endpoint.is_active ? "Disable" : "Enable"}
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem
            onClick={() => setShowDeleteConfirm(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="text-destructive" />
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Endpoint</AlertDialogTitle>
            <AlertDialogDescription>
              Delete{" "}
              <span className="font-medium">
                {endpoint.method} {endpoint.path}
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete(endpoint.id)}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
