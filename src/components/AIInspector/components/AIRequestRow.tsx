import { memo, useCallback } from 'react'

import { AI_STATUS_COLORS, AI_STATUS_BG, CHANNEL_LABELS } from '../AIInspector.constants'
import type { AIRequestRowProps } from '../AIInspector.types'

function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function formatDuration(ms: number | null): string {
  if (ms === null) return '—'
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

export const AIRequestRow = memo(function AIRequestRow({ request, isSelected, onSelect }: AIRequestRowProps): React.JSX.Element {
  const statusColor = AI_STATUS_COLORS[request.status] ?? 'text-muted-foreground'
  const statusBg = AI_STATUS_BG[request.status] ?? ''
  const channelLabel = CHANNEL_LABELS[request.channel] ?? request.channel

  const rowClass = isSelected
    ? 'bg-primary/10 border-l-2 border-l-primary'
    : 'border-l-2 border-l-transparent hover:bg-secondary'

  const handleClick = useCallback(() => onSelect(request.id), [onSelect, request.id])

  return (
    <button
      onClick={handleClick}
      className={`w-full flex flex-col gap-1.5 px-3 py-2.5 text-left transition-colors cursor-pointer border-b border-border/40 last:border-b-0 ${rowClass}`}
    >
      {/* Row 1: Status + Channel */}
      <div className="flex items-center gap-2">
        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${statusBg} ${statusColor}`}>
          {request.status}
        </span>
        <span className="text-xs font-medium text-foreground truncate flex-1">{channelLabel}</span>
      </div>

      {/* Row 2: Origin + Model + Duration + Time */}
      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
        <span className="bg-secondary/60 px-1.5 py-0.5 rounded">{request.originApp}</span>
        {request.model && (
          <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded truncate max-w-[120px]">{request.model}</span>
        )}
        {request.streamChunks > 0 && (
          <span className="text-blue-500/70">{request.streamChunks} chunks</span>
        )}
        <span className="tabular-nums">{formatDuration(request.duration)}</span>
        <span className="tabular-nums ml-auto">{formatTimestamp(request.startedAt)}</span>
      </div>

      {/* Row 3: User message preview */}
      {request.userMessage && (
        <p className="text-[10px] text-muted-foreground/70 truncate leading-relaxed">
          {request.userMessage.slice(0, 120)}
        </p>
      )}
    </button>
  )
})
