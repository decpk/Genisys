import { Trash2 } from 'lucide-react'

import { Tooltip } from '@/components/Tooltip'

import { formatSessionDuration } from '../../utils/formatSessionDuration'
import { formatSessionTime } from '../../utils/formatSessionTime'
import { getPhaseStyle } from '../../utils/getPhaseStyle'
import type { HistorySessionRowProps } from './HistorySessionRow.types'

export function HistorySessionRow(props: HistorySessionRowProps): React.JSX.Element {
  const { session, onDelete } = props
  const phase = getPhaseStyle(session.phase)

  return (
    <div className="group flex items-center gap-2.5 rounded-md px-2 py-2 text-xs hover:bg-muted/40 transition-colors">
      <span
        className="size-2 rounded-full shrink-0"
        style={{ backgroundColor: phase.color }}
        aria-hidden
      />
      <span className="text-muted-foreground tabular-nums w-10 shrink-0">
        {formatSessionTime(session.completedAt as unknown as number)}
      </span>
      <div className="flex-1 min-w-0 flex items-center gap-2">
        <span className="truncate text-foreground/90">{phase.label}</span>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70 shrink-0">
          {session.mode}
        </span>
      </div>
      <span className="shrink-0 rounded-md bg-muted/60 px-1.5 py-0.5 text-[11px] font-medium tabular-nums">
        {formatSessionDuration(session.durationSec)}
      </span>
      <Tooltip content="Delete session" side="top">
        <button
          type="button"
          onClick={() => onDelete(session.id)}
          className="opacity-0 group-hover:opacity-100 inline-flex size-6 items-center justify-center rounded-md text-destructive hover:bg-destructive/10 transition-all"
        >
          <Trash2 size={12} />
        </button>
      </Tooltip>
    </div>
  )
}
