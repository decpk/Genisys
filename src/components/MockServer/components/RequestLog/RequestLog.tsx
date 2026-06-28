import { useRef, useEffect, useState, useMemo, useCallback } from 'react'
import { Trash2, ChevronDown, ChevronRight, Copy, Check, ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import { JsonView } from 'react-json-view-lite'
import type { StyleProps } from 'react-json-view-lite/dist/DataRenderer'

import { cn } from '@/lib/utils'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { IconButton } from '@/components/ui/icon-button'
import { Tooltip } from '@/components/Tooltip'
import { useMockServerStore } from '@/store/mock-server-store'
import type { RequestLogEntry } from '../../MockServer.types'
import { RequestLogFilters } from './components/RequestLogFilters'
import { RequestLogExportButton } from './components/RequestLogExportButton'

const shouldExpandNode = (level: number): boolean => level < 3

const JSON_VIEW_STYLES: StyleProps = {
  container: 'jv-container',
  basicChildStyle: 'jv-child',
  label: 'jv-key',
  clickableLabel: 'jv-key jv-clickable',
  nullValue: 'jv-null',
  undefinedValue: 'jv-undefined',
  numberValue: 'jv-number',
  stringValue: 'jv-string',
  booleanValue: 'jv-boolean',
  otherValue: 'jv-other',
  punctuation: 'jv-bracket',
  expandIcon: 'jv-expand-icon',
  collapseIcon: 'jv-collapse-icon',
  collapsedContent: 'jv-collapsed',
  childFieldsContainer: 'jv-fields',
  noQuotesForStringValues: false,
  quotesForFieldNames: false,
  stringifyStringValues: false,
  ariaLables: { collapseJson: 'Collapse', expandJson: 'Expand' },
}

const METHOD_COLORS: Record<string, string> = {
  GET: 'bg-emerald-500/15 text-emerald-500',
  POST: 'bg-blue-500/15 text-blue-500',
  PUT: 'bg-amber-500/15 text-amber-500',
  PATCH: 'bg-yellow-500/15 text-yellow-500',
  DELETE: 'bg-red-500/15 text-red-500',
  OPTIONS: 'bg-purple-500/15 text-purple-500',
  HEAD: 'bg-gray-500/15 text-gray-400',
}

function formatTime(timestamp: string): string {
  try {
    const d = new Date(timestamp)
    const hh = String(d.getHours()).padStart(2, '0')
    const mm = String(d.getMinutes()).padStart(2, '0')
    const ss = String(d.getSeconds()).padStart(2, '0')
    return `${hh}:${mm}:${ss}`
  } catch {
    return timestamp
  }
}

function getStatusColor(status: number): string {
  if (status >= 200 && status < 300) return 'text-emerald-500'
  if (status >= 300 && status < 400) return 'text-blue-400'
  if (status >= 400 && status < 500) return 'text-amber-500'
  return 'text-red-500'
}

function getStatusBg(status: number): string {
  if (status >= 200 && status < 300) return 'bg-emerald-500/10'
  if (status >= 300 && status < 400) return 'bg-blue-500/10'
  if (status >= 400 && status < 500) return 'bg-amber-500/10'
  return 'bg-red-500/10'
}

function getDurationColor(ms: number): string {
  if (ms < 50) return 'text-emerald-500'
  if (ms < 200) return 'text-amber-500'
  return 'text-red-400'
}

function tryFormatJson(str: string): { formatted: string; isJson: boolean } {
  if (!str) return { formatted: str, isJson: false }
  try {
    const parsed = JSON.parse(str)
    return { formatted: JSON.stringify(parsed, null, 2), isJson: true }
  } catch {
    return { formatted: str, isJson: false }
  }
}

function parseQueryParams(qs: string): [string, string][] {
  if (!qs) return []
  try {
    const params = new URLSearchParams(qs)
    return Array.from(params.entries())
  } catch {
    return []
  }
}

// ─── Copy Button ────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [text])

  return (
    <Tooltip content="Copy" side="top">
      <button
        onClick={handleCopy}
        className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground/60 hover:text-foreground hover:bg-muted transition-colors"
      >
        {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
      </button>
    </Tooltip>
  )
}

// ─── Key-Value Table ────────────────────────────────────────────

function KeyValueTable({ data, emptyText }: { data: Record<string, string>; emptyText: string }) {
  const entries = Object.entries(data)
  if (entries.length === 0) {
    return <p className="px-3 py-3 text-xs text-muted-foreground/60 italic">{emptyText}</p>
  }
  return (
    <div className="divide-y divide-border/40">
      {entries.map(([key, value]) => (
        <div key={key} className="flex gap-3 px-3 py-1.5 text-[11px] group/row">
          <span className="shrink-0 font-medium text-muted-foreground min-w-[120px]">
            {key}
          </span>
          <span className="flex-1 text-foreground/80 break-all">{value}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Body Viewer ────────────────────────────────────────────────

function BodyViewer({ body, label }: { body: string; label: string }) {
  const hasBody = body.length > 0
  const { formatted, isJson } = tryFormatJson(body)

  const parsedData = useMemo(() => {
    if (!isJson) return null
    try {
      return JSON.parse(body)
    } catch {
      return null
    }
  }, [body, isJson])

  if (!hasBody) {
    return <p className="px-3 py-3 text-xs text-muted-foreground/60 italic">No {label} body</p>
  }

  return (
    <div className="relative">
      <div className="flex items-center justify-between px-3 py-1">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground/50 font-medium">
          {isJson ? "JSON" : "Text"} · {body.length.toLocaleString()} bytes
        </span>
        <CopyButton text={body} />
      </div>
      <div className="max-h-[400px] overflow-auto px-3 pb-3">
        {isJson && parsedData !== null ? (
          <div className="text-xs">
            <JsonView
              data={parsedData}
              shouldExpandNode={shouldExpandNode}
              clickToExpandNode
              style={JSON_VIEW_STYLES}
            />
          </div>
        ) : (
          <pre className="text-[11px] leading-relaxed whitespace-pre-wrap break-all text-foreground/70">
            {formatted}
          </pre>
        )}
      </div>
    </div>
  );
}

// ─── Detail Tabs ────────────────────────────────────────────────

type DetailTab = 'request' | 'response'

function LogDetail({ log }: { log: RequestLogEntry }) {
  const [activeTab, setActiveTab] = useState<DetailTab>('request')
  const queryParams = useMemo(() => parseQueryParams(log.query_string ?? ''), [log.query_string])

  return (
    <div className="border-t border-border/30 bg-background/60">
      {/* Tab bar */}
      <div className="flex items-center gap-0 border-b border-border/30">
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as DetailTab)}
        >
          <TabsList>
            <TabsTrigger value="request">
              <span className="flex items-center gap-1.5">
                <ArrowUpRight className="h-3 w-3" />
                Request
              </span>
            </TabsTrigger>
            <TabsTrigger value="response">
              <span className="flex items-center gap-1.5">
                <ArrowDownLeft className="h-3 w-3" />
                Response
              </span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex-1" />
        <span
          className={cn(
            "pr-3 text-[10px] tabular-nums",
            getDurationColor(log.duration_ms),
          )}
        >
          {log.duration_ms}ms
        </span>
      </div>

      {/* Tab content */}
      <div className="max-h-[400px] overflow-y-auto">
        {activeTab === "request" ? (
          <div>
            {/* Query Parameters */}
            {queryParams.length > 0 && (
              <div>
                <div className="px-3 pt-2 pb-1">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground/50 font-semibold">
                    Query Parameters
                  </span>
                </div>
                <KeyValueTable
                  data={Object.fromEntries(queryParams)}
                  emptyText="No query parameters"
                />
              </div>
            )}

            {/* Request Headers */}
            <div>
              <div className="px-3 pt-2 pb-1">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground/50 font-semibold">
                  Headers
                </span>
              </div>
              <KeyValueTable
                data={log.request_headers ?? {}}
                emptyText="No request headers"
              />
            </div>

            {/* Request Body */}
            <div>
              <div className="px-3 pt-2 pb-1">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground/50 font-semibold">
                  Body
                </span>
              </div>
              <BodyViewer body={log.request_body ?? ""} label="request" />
            </div>
          </div>
        ) : (
          <div>
            {/* Status */}
            <div className="flex items-center gap-3 px-3 py-2 border-b border-border/20">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground/50 font-semibold">
                Status
              </span>
              <span
                className={cn(
                  "rounded-md px-2 py-0.5 text-xs font-semibold",
                  getStatusColor(log.status),
                  getStatusBg(log.status),
                )}
              >
                {log.status}
              </span>
            </div>

            {/* Response Headers */}
            <div>
              <div className="px-3 pt-2 pb-1">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground/50 font-semibold">
                  Headers
                </span>
              </div>
              <KeyValueTable
                data={log.response_headers ?? {}}
                emptyText="No response headers"
              />
            </div>

            {/* Response Body */}
            <div>
              <div className="px-3 pt-2 pb-1">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground/50 font-semibold">
                  Body
                </span>
              </div>
              <BodyViewer body={log.response_body ?? ""} label="response" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main RequestLog ────────────────────────────────────────────

interface RequestLogProps {
  onToggleCollapse?: () => void
}

export function RequestLog(props: RequestLogProps) {
  const { onToggleCollapse } = props
  const requestLogs = useMockServerStore((s) => s.requestLogs)
  const clearLogs = useMockServerStore((s) => s.clearLogs)
  const selectedServerId = useMockServerStore((s) => s.selectedServerId)
  const clearRequestLogsPersisted = useMockServerStore((s) => s.clearRequestLogsPersisted)

  const scrollRef = useRef<HTMLDivElement>(null)
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  useEffect(() => {
    if (scrollRef.current && expandedIndex === null) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [requestLogs, expandedIndex])

  const logCount = requestLogs.length

  const handleRowClick = useCallback((index: number) => {
    setExpandedIndex((prev) => (prev === index ? null : index))
  }, [])

  const handleClear = useCallback(() => {
    clearLogs()
    if (selectedServerId !== null) {
      void clearRequestLogsPersisted(selectedServerId)
    }
    setExpandedIndex(null)
  }, [clearLogs, clearRequestLogsPersisted, selectedServerId])

  return (
    <div className="flex flex-col h-full border-t border-border/30 bg-muted/10 overflow-hidden">
      {/* Row 1: title + actions */}
      <div className="flex items-center justify-between px-4 pt-2 pb-1 shrink-0">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Request Log
          </h3>
          {logCount > 0 && (
            <span className="rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              {logCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <RequestLogExportButton />
          <IconButton
            variant="ghost"
            size="xs"
            tooltip="Clear logs"
            onClick={handleClear}
          >
            <Trash2 className="h-3 w-3" />
          </IconButton>
          {onToggleCollapse && (
            <IconButton
              variant="ghost"
              size="xs"
              tooltip="Collapse request log"
              onClick={onToggleCollapse}
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </IconButton>
          )}
        </div>
      </div>
      {/* Row 2: filters — stretches full width */}
      <div className="px-4 pb-2 shrink-0">
        <RequestLogFilters className="w-full" />
      </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-2 pb-2">
          {logCount === 0 ? (
            <p className="px-2 py-6 text-center text-xs text-muted-foreground">
              No requests yet. Start a server and make some requests.
            </p>
          ) : (
            <div className="flex flex-col gap-1">
              {requestLogs.map((log, i) => {
                const methodColor = METHOD_COLORS[log.method] ?? 'bg-gray-500/15 text-gray-400'
                const statusColor = getStatusColor(log.status)
                const statusBg = getStatusBg(log.status)
                const isExpanded = expandedIndex === i
                return (
                  <div
                    key={i}
                    className={cn(
                      "rounded-lg overflow-hidden transition-all border",
                      isExpanded
                        ? "bg-accent/60 border-border shadow-sm"
                        : "border-transparent hover:bg-muted/40 hover:border-border/50",
                    )}
                  >
                    {/* Summary row – 2-line layout */}
                    <div
                      onClick={() => handleRowClick(i)}
                      className="flex flex-col gap-0.5 px-3 py-2 cursor-pointer"
                    >
                      {/* Line 1: method + path */}
                      <div className="flex items-center gap-2">
                        <ChevronRight
                          className={cn(
                            "h-3 w-3 shrink-0 text-muted-foreground/50 transition-transform duration-200",
                            isExpanded && "rotate-90",
                          )}
                        />
                        <span
                          className={cn(
                            "shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                            methodColor,
                          )}
                        >
                          {log.method}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-[13px] text-foreground">
                          {log.path}
                        </span>
                      </div>
                      {/* Line 2: timestamp · status · duration */}
                      <div className="flex items-center gap-0 pl-5 text-[11px]">
                        <span className="text-muted-foreground/60 tabular-nums">
                          {formatTime(log.timestamp)}
                        </span>
                        <span className="mx-1.5 text-muted-foreground/30">
                          ·
                        </span>
                        <span
                          className={cn(
                            "rounded px-1.5 py-px font-medium text-[10px]",
                            statusColor,
                            statusBg,
                          )}
                        >
                          {log.status}
                        </span>
                        <span className="mx-1.5 text-muted-foreground/30">
                          ·
                        </span>
                        <span
                          className={cn(
                            "tabular-nums",
                            getDurationColor(log.duration_ms),
                          )}
                        >
                          {log.duration_ms}ms
                        </span>
                      </div>
                    </div>

                    {/* Expandable detail */}
                    {isExpanded && <LogDetail log={log} />}
                  </div>
                );
              })}
            </div>
          )}
        </div>
    </div>
  )
}
