import { memo, useCallback } from 'react'

import { STATUS_COLORS, STATUS_BG_COLORS } from '../../DebugPanel.constants'
import {
  formatTimestamp,
  formatDuration,
  getChannelAppSource,
  getStatusLabel
} from '../../DebugPanel.utils'
import type { RequestRowProps } from '../../DebugPanel.types'

export const RequestRow = memo(function RequestRow({ request, isSelected, onSelect }: RequestRowProps): React.JSX.Element {
  const statusColor = STATUS_COLORS[request.status] ?? 'text-muted-foreground'
  const statusBg = STATUS_BG_COLORS[request.status] ?? ''
  const appSource = getChannelAppSource(request.channel)
  const statusLabel = getStatusLabel(request.status)

  const rowClass = isSelected
    ? 'bg-primary/10 border-l-2 border-l-primary'
    : 'border-l-2 border-l-transparent hover:bg-secondary'

  const handleClick = useCallback(() => onSelect(request.id), [onSelect, request.id])

  return (
    <button
      onClick={handleClick}
      className={`w-full flex flex-col gap-1 px-3 py-2 text-left transition-colors cursor-pointer border-b border-border/40 last:border-b-0 ${rowClass}`}
    >
      <div className="flex items-center gap-2">
        <span
          className={`text-[10px] font-medium px-1 py-0.5 rounded ${statusBg} ${statusColor}`}
        >
          {statusLabel}
        </span>
        <span className="text-xs text-foreground truncate flex-1">
          {request.channel}
        </span>
      </div>
      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
        <span className="bg-secondary/60 px-1 py-0.5 rounded">{appSource}</span>
        <span className="tabular-nums">{formatDuration(request.duration)}</span>
        <span className="tabular-nums ml-auto">
          {formatTimestamp(request.startedAt)}
        </span>
      </div>
    </button>
  );
})
