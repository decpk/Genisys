import { useCallback, useMemo, useRef, useState } from 'react'
import { X, Sparkles, Link, Copy, Check } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Tooltip } from '@/components/Tooltip'
import { useMockServerStore } from '@/store/mock-server-store'
import type { MockEndpoint } from '@/components/MockServer/MockServer.types'
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from '@/components/ui/context-menu'
import { TestInApiClientButton } from './TestInApiClientButton'

const METHOD_STYLES: Record<string, string> = {
  GET: 'text-emerald-500',
  POST: 'text-blue-500',
  PUT: 'text-amber-500',
  PATCH: 'text-yellow-600',
  DELETE: 'text-red-500',
  OPTIONS: 'text-purple-500',
  HEAD: 'text-gray-400',
}

interface EndpointTabProps {
  endpoint: MockEndpoint
  isActive: boolean
  isDirty?: boolean
  onActivate: (id: string) => void
  onClose: (id: string) => void
  onCloseOthers: (id: string) => void
  onCloseAll: () => void
  onDuplicate: (id: string) => void
  onDelete: (id: string) => void
}

export function EndpointTab(props: EndpointTabProps) {
  const {
    endpoint,
    isActive,
    isDirty,
    onActivate,
    onClose,
    onCloseOthers,
    onCloseAll,
    onDuplicate,
    onDelete,
  } = props

  const methodStyle = METHOD_STYLES[endpoint.method] ?? 'bg-gray-500/10 text-gray-400'
  const isAi = endpoint.response_type === 'ai'

  const servers = useMockServerStore((s) => s.servers)
  const server = useMemo(
    () => servers.find((s) => s.id === endpoint.server_id) ?? null,
    [servers, endpoint.server_id],
  )
  const fullUrl = `http://localhost:${server?.port ?? 3000}${endpoint.path}`

  const [copied, setCopied] = useState(false)
  const copyResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleCopyPath = useCallback(() => {
    navigator.clipboard.writeText(fullUrl)
    setCopied(true)
    if (copyResetTimer.current) clearTimeout(copyResetTimer.current)
    copyResetTimer.current = setTimeout(() => setCopied(false), 1200)
  }, [fullUrl])

  const handleMouseDown = (e: React.MouseEvent) => {
    // Middle-click to close
    if (e.button === 1) {
      e.preventDefault()
      onClose(endpoint.id)
    }
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <button
          onClick={() => onActivate(endpoint.id)}
          onMouseDown={handleMouseDown}
          className={cn(
            "group relative flex h-9 shrink-0 items-center gap-1.5 border-r border-border/40 pl-3 pr-2 text-xs transition-colors select-none",
            isActive
              ? "bg-background text-foreground"
              : "bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground",
          )}
        >
          {/* Active top accent line (VS Code style) */}
          {isActive && (
            <span className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-primary" />
          )}

          {/* Method badge */}
          <span
            className={cn(
              "shrink-0 text-[10px] font-semibold uppercase tracking-wide transition-colors",
              methodStyle,
            )}
          >
            {endpoint.method}
          </span>

          {/* Path */}
          <span className="max-w-[150px] truncate text-[11px]">
            {endpoint.path}
          </span>

          {/* AI indicator */}
          {isAi && (
            <Sparkles className="h-2.5 w-2.5 shrink-0 text-indigo-400" />
          )}

          {/* Trailing actions — aligned with a consistent gap */}
          <span className="ml-1 flex items-center gap-1">
            {/* Test in API Client — reveals on hover/active, left of copy */}
            <TestInApiClientButton endpoint={endpoint} isActive={isActive} />

            {/* Copy path button — subtle, reveals on hover/active */}
            <Tooltip content={copied ? "Copied!" : "Copy path"} side="top">
              <span
                role="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopyPath();
                }}
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded text-muted-foreground transition-all hover:bg-foreground/10 hover:text-foreground",
                  copied || isActive
                    ? "opacity-100"
                    : "opacity-0 group-hover:opacity-100",
                )}
              >
                {copied ? (
                  <Check className="h-3 w-3 text-emerald-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </span>
            </Tooltip>

            {/* Close / dirty indicator */}
            <Tooltip
              content={
                isDirty
                  ? 'Unsaved changes. Save or cancel before closing.'
                  : 'Close endpoint tab'
              }
              side="top"
            >
              <span
                role="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isDirty) onClose(endpoint.id);
                }}
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded transition-colors hover:bg-foreground/10"
              >
                {isDirty ? (
                  <span className="h-2 w-2 rounded-full bg-primary group-hover:hidden" />
                ) : null}
                <X
                  className={cn(
                    "h-3 w-3 text-muted-foreground transition-opacity hover:text-foreground",
                    isDirty
                      ? "hidden group-hover:block"
                      : isActive
                        ? "opacity-100"
                        : "opacity-0 group-hover:opacity-100",
                  )}
                />
              </span>
            </Tooltip>
          </span>
        </button>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={handleCopyPath}>
          <Link className="h-3.5 w-3.5" />
          Copy Path
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={() => onClose(endpoint.id)}>
          Close
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onCloseOthers(endpoint.id)}>
          Close Others
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onCloseAll()}>
          Close All
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={() => onDuplicate(endpoint.id)}>
          Duplicate
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          onClick={() => onDelete(endpoint.id)}
          className="text-red-500 focus:text-red-500"
        >
          Delete Endpoint
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
