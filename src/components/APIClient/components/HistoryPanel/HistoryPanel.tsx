import { useEffect, useCallback, useState, useMemo } from 'react'
import { Clock, Trash2, RotateCcw, X } from 'lucide-react'
import { scopedToast } from '@/frameworks/notification'

const toast = scopedToast('api-client')
import { PanelHeading } from '@/components/ui/panel-heading'
import { EmptyState } from '@/components/ui/empty-state'
import { SearchInput } from '@/components/ui/search-input'
import { Tooltip } from '@/components/Tooltip/Tooltip'
import { useApiClientStore } from '@/store/api-client-store'
import { METHOD_BG_COLORS } from '../../APIClient.constants'
import type { HttpMethod, ApiHistoryEntry } from '../../APIClient.types'

// ─── Helpers ─────────────────────────────────────────────────────

function getStatusColor(code: number): string {
  if (code >= 200 && code < 300) return 'text-emerald-400'
  if (code >= 300 && code < 400) return 'text-blue-400'
  if (code >= 400 && code < 500) return 'text-amber-400'
  if (code >= 500) return 'text-red-400'
  return 'text-muted-foreground/40'
}

function getStatusHoverBg(code: number): string {
  if (code >= 200 && code < 300) return "hover:bg-emerald-400/[0.12]";
  if (code >= 300 && code < 400) return "hover:bg-blue-400/[0.12]";
  if (code >= 400 && code < 500) return "hover:bg-amber-400/[0.12]";
  if (code >= 500) return "hover:bg-red-400/[0.12]";
  return "hover:bg-muted/30";
}

function getTimingColor(ms: number): string {
  if (ms < 200) return 'bg-emerald-400'
  if (ms < 500) return 'bg-amber-400'
  return 'bg-red-400'
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 60_000) return 'just now'
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)}m ago`
  if (diff < 86400_000) return `${Math.floor(diff / 3600_000)}h ago`
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(1)} MB`
}

function getTimeGroup(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const entryDay = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  if (entryDay.getTime() === today.getTime()) return 'Today'
  if (today.getTime() - entryDay.getTime() === 86400_000) return 'Yesterday'
  if (diff < 604800_000) return d.toLocaleDateString(undefined, { weekday: 'long' })
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

interface TimelineGroup {
  label: string
  entries: ApiHistoryEntry[]
}

// ─── History Panel ───────────────────────────────────────────────

export function HistoryPanel(): React.JSX.Element {
  const history = useApiClientStore((s) => s.history)
  const loadHistory = useApiClientStore((s) => s.loadHistory)
  const clearHistory = useApiClientStore((s) => s.clearHistory)
  const removeHistoryEntry = useApiClientStore((s) => s.removeHistoryEntry)
  const setActiveRequestId = useApiClientStore((s) => s.setActiveRequestId)
  const setSidebarTab = useApiClientStore((s) => s.setSidebarTab)
  const activeRequestId = useApiClientStore((s) => s.activeRequestId)
  const requests = useApiClientStore((s) => s.requests)

  const [filter, setFilter] = useState('')
  const [methodFilter, setMethodFilter] = useState<string | null>(null)

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  const handleEntryClick = useCallback((entry: ApiHistoryEntry) => {
    if (entry.requestId) {
      const requestExists = requests.some((r) => r.id === entry.requestId)
      if (requestExists) {
        setActiveRequestId(entry.requestId)
        setSidebarTab('collections')
      } else {
        toast.info('Original request was deleted')
      }
    } else {
      toast.info('No saved request linked to this entry')
    }
  }, [setActiveRequestId, setSidebarTab, requests])

  const filteredHistory = history.filter((entry) => {
    if (methodFilter && entry.method !== methodFilter) return false
    if (filter) {
      const q = filter.toLowerCase()
      const matchesUrl = entry.url.toLowerCase().includes(q)
      const matchesName = entry.name.toLowerCase().includes(q)
      const matchesStatus = entry.statusCode.toString().includes(q)
      if (!matchesUrl && !matchesName && !matchesStatus) return false
    }
    return true
  })

  const timelineGroups = useMemo<TimelineGroup[]>(() => {
    const groups: TimelineGroup[] = []
    let currentLabel = ''
    for (const entry of filteredHistory) {
      const label = getTimeGroup(entry.executedAt)
      if (label !== currentLabel) {
        groups.push({ label, entries: [entry] })
        currentLabel = label
      } else {
        groups[groups.length - 1].entries.push(entry)
      }
    }
    return groups
  }, [filteredHistory])

  const methodCounts: Record<string, number> = {}
  for (const entry of history) {
    methodCounts[entry.method] = (methodCounts[entry.method] ?? 0) + 1
  }

  return (
    <div className="flex flex-col h-full">
      <PanelHeading icon={Clock} title="History" count={history.length}>
        {history.length > 0 && (
          <Tooltip content="Clear History" side="bottom">
            <button
              onClick={clearHistory}
              className="p-1 rounded-md text-muted-foreground hover:text-red-400 hover:bg-muted/50 transition-colors"
            >
              <Trash2 size={13} />
            </button>
          </Tooltip>
        )}
      </PanelHeading>

      <div className="px-2.5 pt-2 pb-1.5">
        <SearchInput
          placeholder="Search history..."
          value={filter}
          onChange={setFilter}
        />
      </div>

      {/* Method filter chips */}
      {Object.keys(methodCounts).length > 1 && (
        <div className="px-2.5 pb-1.5 flex gap-1 flex-wrap">
          <button
            onClick={() => setMethodFilter(null)}
            className={`px-2 py-0.5 text-2xs rounded-md transition-colors ${
              !methodFilter
                ? "bg-primary/20 text-primary"
                : "bg-muted/20 text-muted-foreground/60 hover:bg-muted/40"
            }`}
          >
            All
          </button>
          {Object.entries(methodCounts).map(([method, count]) => (
            <button
              key={method}
              onClick={() =>
                setMethodFilter(methodFilter === method ? null : method)
              }
              className={`px-2 py-0.5 text-2xs rounded-md transition-colors ${
                methodFilter === method
                  ? "bg-primary/20 text-primary"
                  : "bg-muted/20 text-muted-foreground/60 hover:bg-muted/40"
              }`}
            >
              {method} ({count})
            </button>
          ))}
        </div>
      )}

      <div className="h-px bg-border/20 mx-2.5" />

      {/* History list */}
      <div className="flex-1 overflow-y-auto py-1 px-1.5">
        {filteredHistory.length === 0 ? (
          <EmptyState
            icon={Clock}
            message={
              history.length === 0 ? "No history yet" : "No matching entries"
            }
          />
        ) : (
          timelineGroups.map((group) => (
            <div key={group.label} className="mb-1">
              {/* Time group header */}
              <div className="flex items-center gap-2 px-1.5 pt-2 pb-1">
                <span className="text-2xs font-semibold uppercase tracking-wider text-muted-foreground/50">
                  {group.label}
                </span>
                <div className="flex-1 h-px bg-border/15" />
              </div>

              {/* Entries */}
              <div className="flex flex-col gap-1">
                {group.entries.map((entry) => (
                  <HistoryEntryRow
                    key={entry.id}
                    entry={entry}
                    isActive={
                      entry.requestId === activeRequestId &&
                      activeRequestId !== null
                    }
                    onClick={() => handleEntryClick(entry)}
                    onRemove={() => removeHistoryEntry(entry.id)}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── History Entry Row ──────────────────────────────────────────

interface HistoryEntryRowProps {
  entry: ApiHistoryEntry
  isActive: boolean
  onClick: () => void
  onRemove: () => void
}

function HistoryEntryRow(props: HistoryEntryRowProps): React.JSX.Element {
  const { entry, isActive, onClick, onRemove } = props

  const methodBg = METHOD_BG_COLORS[entry.method as HttpMethod] ?? 'bg-muted/20 text-muted-foreground'

  let urlPath = entry.url
  try {
    const u = new URL(entry.url)
    urlPath = u.pathname + u.search
  } catch { /* show full url */ }

  return (
    <div
      className={`
        group relative min-w-0 px-2.5 py-2 rounded-md cursor-pointer
        transition-all duration-150
        ${isActive ? "bg-primary/8" : getStatusHoverBg(entry.statusCode)}
      `}
      onClick={onClick}
    >
      {/* Row 1: Method pill + status code + hover actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span
            className={`px-1 py-px rounded text-3xs font-bold uppercase leading-none shrink-0 ${methodBg}`}
          >
            {entry.method}
          </span>
          {entry.statusCode > 0 && (
            <span
              className={`text-3xs font-semibold ${getStatusColor(entry.statusCode)}`}
            >
              {entry.statusCode}
            </span>
          )}
        </div>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <Tooltip content="Open Request" side="left">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
              className="p-0.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
            >
              <RotateCcw size={10} />
            </button>
          </Tooltip>
          <Tooltip content="Delete" side="left">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="p-0.5 rounded text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors"
            >
              <X size={10} />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Row 2: Title / name */}
      <div className="text-2xs font-medium truncate text-foreground/90 mt-1">
        {entry.name || urlPath}
      </div>

      {/* Row 3: URL */}
      <div className="text-2xs text-muted-foreground/35 truncate mt-0.5">
        {entry.url}
      </div>

      {/* Row 4: Metadata — full width, spaced between */}
      <div className="flex items-center justify-between mt-1">
        <span className="flex items-center gap-1 text-3xs text-muted-foreground/50">
          <span
            className={`inline-block size-1.5 rounded-full ${getTimingColor(entry.durationMs)}`}
          />
          {entry.durationMs}ms
        </span>
        {entry.sizeBytes > 0 && (
          <span className="text-3xs text-muted-foreground/50">
            {formatSize(entry.sizeBytes)}
          </span>
        )}
        <span className="text-3xs text-muted-foreground/40">
          {formatTime(entry.executedAt)}
        </span>
        {entry.environmentName && (
          <span className="text-3xs text-muted-foreground/40">
            {entry.environmentName}
          </span>
        )}
      </div>
    </div>
  );
}
