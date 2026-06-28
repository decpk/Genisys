import { cn } from '@/lib/utils'
import { getStatusBgColor, getStatusGlow, getTimingColor } from '../../APIClient.constants'
import { formatBytes, formatTime } from '../../utils/format-response'
import type { ApiResponse } from '../../APIClient.types'

interface ResponseMetaProps {
  response: ApiResponse
}

export function ResponseMeta(props: ResponseMetaProps): React.JSX.Element {
  const { response } = props

  const isError = response.status === 0

  return (
    <div className="flex items-center gap-3 px-3 py-2 border-b border-border/30 text-xs">
      {/* Status badge */}
      <span className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold tabular-nums',
        isError ? 'bg-red-400/10 text-red-400 border-red-400/20 shadow-[0_0_12px_rgba(248,113,113,0.15)]' : cn(getStatusBgColor(response.status), getStatusGlow(response.status))
      )}>
        {isError ? 'Error' : response.status}
      </span>
      <span className="text-muted-foreground font-medium">{response.statusText}</span>

      <div className="flex-1" />

      {/* Time stat */}
      <div className="flex items-center gap-1.5">
        <span className={cn('w-1.5 h-1.5 rounded-full', getTimingColor(response.time))} />
        <span className="text-muted-foreground/60">Time</span>
        <span className="text-foreground font-medium tabular-nums">{formatTime(response.time)}</span>
      </div>

      <div className="w-px h-3.5 bg-border/30" />

      {/* Size stat */}
      <div className="flex items-center gap-1.5">
        <span className="text-muted-foreground/60">Size</span>
        <span className="text-foreground font-medium tabular-nums">{formatBytes(response.size)}</span>
      </div>
    </div>
  )
}
