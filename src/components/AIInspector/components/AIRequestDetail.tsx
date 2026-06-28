import { memo, useCallback, useState } from 'react'
import { Check, Copy } from 'lucide-react'

import { Tooltip } from '@/components/Tooltip'
import { IconButton } from '@/components/ui/icon-button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { AI_STATUS_COLORS, AI_STATUS_BG, CHANNEL_LABELS } from '../AIInspector.constants'
import type { AIRequestDetailProps } from '../AIInspector.types'

type DetailTab = 'request' | 'response' | 'timeline'

function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 })
}

function formatDuration(ms: number | null): string {
  if (ms === null) return '—'
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(2)}s`
}

function formatJson(data: unknown): string {
  if (data === null || data === undefined) return '—'
  try {
    return JSON.stringify(data, null, 2)
  } catch {
    return String(data)
  }
}

function CopyButton({ text }: { text: string }): React.JSX.Element {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {}
  }, [text])

  return (
    <Tooltip content={copied ? 'Copied!' : 'Copy'}>
      <IconButton variant="ghost" size="xs" onClick={handleCopy}>
        {copied ? <Check size={12} className="text-success" /> : <Copy size={12} />}
      </IconButton>
    </Tooltip>
  )
}

function JsonBlock({ label, data }: { label: string; data: unknown }): React.JSX.Element {
  const json = formatJson(data)
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <h4 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </h4>
        {json !== "—" && <CopyButton text={json} />}
      </div>
      <pre className="text-[11px] text-foreground bg-secondary/30 rounded-md p-3 overflow-auto max-h-[300px] whitespace-pre-wrap break-all border border-border/30">
        {json}
      </pre>
    </div>
  );
}

function TextBlock({ label, text }: { label: string; text: string }): React.JSX.Element | null {
  if (!text) return null
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <h4 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{label}</h4>
        <CopyButton text={text} />
      </div>
      <div className="text-xs text-foreground bg-secondary/30 rounded-md p-3 overflow-auto max-h-[200px] whitespace-pre-wrap break-words border border-border/30 leading-relaxed">
        {text}
      </div>
    </div>
  )
}

export const AIRequestDetail = memo(function AIRequestDetail({ request }: AIRequestDetailProps): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<DetailTab>('request')

  const statusColor = AI_STATUS_COLORS[request.status] ?? 'text-muted-foreground'
  const statusBg = AI_STATUS_BG[request.status] ?? ''
  const channelLabel = CHANNEL_LABELS[request.channel] ?? request.channel

  return (
    <div className="h-full flex flex-col">
      {/* Header bar */}
      <div className="shrink-0 border-b border-border/40 bg-card px-4 py-3 space-y-2.5">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-sm font-semibold text-foreground">
            {channelLabel}
          </h2>
          <span
            className={`text-[11px] font-medium px-1.5 py-0.5 rounded ${statusBg} ${statusColor}`}
          >
            {request.status}
          </span>
          <span className="text-[11px] text-muted-foreground bg-secondary/60 px-1.5 py-0.5 rounded">
            {request.originApp}
          </span>
          {request.model && (
            <span className="text-[11px] text-primary bg-primary/10 px-1.5 py-0.5 rounded">
              {request.model}
            </span>
          )}
        </div>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-x-6 gap-y-1">
          <MetaField label="Request ID" value={request.id} mono />
          <MetaField label="Channel" value={request.channel} mono />
          <MetaField
            label="Started"
            value={formatTimestamp(request.startedAt)}
          />
          <MetaField
            label="Completed"
            value={
              request.completedAt ? formatTimestamp(request.completedAt) : "—"
            }
          />
          <MetaField
            label="Duration"
            value={formatDuration(request.duration)}
          />
          <MetaField
            label="Stream Chunks"
            value={String(request.streamChunks)}
          />
        </div>

        {request.error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">
            <p className="text-[11px] font-medium text-red-500 mb-1">Error</p>
            <pre className="text-xs text-red-400 whitespace-pre-wrap break-all">
              {request.error}
            </pre>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="shrink-0 border-b border-border/40">
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as DetailTab)}
        >
          <TabsList>
            <TabsTrigger value="request">Request</TabsTrigger>
            <TabsTrigger value="response">Response</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === "request" && <RequestTab request={request} />}
        {activeTab === "response" && <ResponseTab request={request} />}
        {activeTab === "timeline" && <TimelineTab request={request} />}
      </div>
    </div>
  );
})

function RequestTab({ request }: AIRequestDetailProps): React.JSX.Element {
  return (
    <div className="space-y-4">
      <TextBlock label="System Prompt" text={request.systemPrompt} />
      <TextBlock label="User Message" text={request.userMessage} />
      <JsonBlock label="Full Request Payload" data={request.requestPayload} />
    </div>
  )
}

function ResponseTab({ request }: AIRequestDetailProps): React.JSX.Element {
  return (
    <div className="space-y-4">
      <JsonBlock label="Response Payload" data={request.responsePayload} />
    </div>
  )
}

function TimelineTab({ request }: AIRequestDetailProps): React.JSX.Element {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-4">
        <TimelineCard
          label="Started At"
          value={formatTimestamp(request.startedAt)}
        />
        <TimelineCard
          label="Completed At"
          value={
            request.completedAt ? formatTimestamp(request.completedAt) : "—"
          }
        />
        <TimelineCard
          label="Duration"
          value={formatDuration(request.duration)}
          highlight
        />
        <TimelineCard
          label="Stream Chunks"
          value={String(request.streamChunks)}
        />
      </div>

      {/* Visual timeline bar */}
      {request.duration !== null && (
        <div className="space-y-1.5 mt-4">
          <h4 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            Duration Visualization
          </h4>
          <div className="relative h-6 bg-secondary/30 rounded-md border border-border/30 overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-primary/30 rounded-md transition-all"
              style={{ width: "100%" }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-[10px] text-foreground">
              {formatDuration(request.duration)}
            </div>
          </div>
        </div>
      )}

      {/* Status history */}
      <div className="space-y-1.5 mt-4">
        <h4 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
          Status Flow
        </h4>
        <div className="flex items-center gap-2">
          <StatusDot status="pending" active={true} />
          <div className="w-8 h-px bg-border" />
          {request.streamChunks > 0 && (
            <>
              <StatusDot
                status="streaming"
                active={request.status !== "pending"}
              />
              <div className="w-8 h-px bg-border" />
            </>
          )}
          <StatusDot
            status={request.status === "error" ? "error" : "success"}
            active={request.status === "success" || request.status === "error"}
          />
        </div>
      </div>
    </div>
  );
}

function TimelineCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }): React.JSX.Element {
  return (
    <div
      className={`rounded-md border border-border/30 p-3 ${highlight ? "bg-primary/5" : "bg-secondary/20"}`}
    >
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
        {label}
      </p>
      <p
        className={`text-sm tabular-nums ${highlight ? "text-primary font-semibold" : "text-foreground"}`}
      >
        {value}
      </p>
    </div>
  );
}

function StatusDot({ status, active }: { status: string; active: boolean }): React.JSX.Element {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-500',
    streaming: 'bg-blue-500',
    success: 'bg-green-500',
    error: 'bg-red-500',
  }
  const bg = active ? (colors[status] ?? 'bg-muted') : 'bg-muted'
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`w-3 h-3 rounded-full ${bg} ${active ? '' : 'opacity-30'}`} />
      <span className="text-[9px] text-muted-foreground capitalize">{status}</span>
    </div>
  )
}

function MetaField({ label, value, mono }: { label: string; value: string; mono?: boolean }): React.JSX.Element {
  return (
    <div className="flex items-baseline gap-2 text-xs">
      <span className="text-muted-foreground shrink-0">{label}:</span>
      <span className={`text-foreground truncate ${mono ? "text-[11px]" : ""}`}>
        {value}
      </span>
    </div>
  );
}
