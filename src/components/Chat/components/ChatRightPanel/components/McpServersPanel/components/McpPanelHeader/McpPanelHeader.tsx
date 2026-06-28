import { Plug, AlertTriangle, CircleCheck } from 'lucide-react'

import type { McpPanelHeaderProps } from './McpPanelHeader.types'

export function McpPanelHeader(props: McpPanelHeaderProps): React.JSX.Element {
  const { total, connected, errored, totalTools } = props

  const allConnected = connected === total && total > 0
  const hasErrors = errored > 0

  const statusIcon = hasErrors
    ? <AlertTriangle size={14} className="text-amber-400" />
    : allConnected
      ? <CircleCheck size={14} className="text-emerald-500" />
      : <Plug size={14} className="text-muted-foreground" />

  const toolsLabel = totalTools === 1 ? '1 tool' : `${totalTools} tools`

  return (
    <div className="flex items-center justify-between px-3 py-2.5 border-b border-border/40">
      <div className="flex items-center gap-2">
        {statusIcon}
        <span className="text-xs font-medium text-foreground">
          {connected}/{total} connected
        </span>
      </div>
      <span className="text-[10px] text-muted-foreground">
        {totalTools > 0 ? toolsLabel : 'No tools'}
      </span>
    </div>
  )
}
