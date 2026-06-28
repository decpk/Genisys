import { ChevronRight, Plug, PlugZap } from 'lucide-react'

import { AppLoaderGlyph } from '@/components/AppLoader'
import { IconButton } from '@/components/ui/icon-button'
import { cn } from '@/lib/utils'

import { getStatusDotClass } from '../../utils/getStatusDotClass'
import { getServerStatusLabel } from '../../utils/getServerStatusLabel'
import { McpToolList } from '../McpToolList'
import type { McpServerCardProps } from './McpServerCard.types'

export function McpServerCard(props: McpServerCardProps): React.JSX.Element {
  const {
    server,
    isExpanded,
    tools,
    loadingTools,
    connectingName,
    onToggleExpand,
    onConnect,
    onDisconnect,
  } = props

  const isConnected = server.status === 'connected'
  const isConnecting = connectingName === server.name
  const dotClass = getStatusDotClass(server.status)

  const toolLabel = server.toolCount === 1 ? '1 tool' : `${server.toolCount} tools`

  const metaText = isConnected
    ? toolLabel
    : server.error
      ? server.error
      : getServerStatusLabel(server.status)

  const metaColor = server.status === 'error' ? 'text-red-400' : 'text-muted-foreground'

  return (
    <div className="rounded-lg border border-border/30 bg-card/40 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2.5">
        <div
          className={cn('flex items-center gap-2 min-w-0 flex-1', isConnected && 'cursor-pointer')}
          onClick={() => isConnected && onToggleExpand(server.name)}
        >
          {isConnected && (
            <ChevronRight
              size={12}
              className={cn(
                'shrink-0 text-muted-foreground transition-transform duration-200',
                isExpanded && 'rotate-90',
              )}
            />
          )}
          <div className={dotClass} />
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-medium text-foreground truncate">{server.name}</p>
            <p className={cn('text-[10px] truncate', metaColor)}>{metaText}</p>
          </div>
        </div>
        <div className="flex items-center gap-0.5 shrink-0 ml-2">
          {isConnected && (
            <IconButton variant="ghost" size="xs" tooltip="Disconnect" tooltipSide="bottom" onClick={() => onDisconnect(server.name)}>
              <PlugZap size={13} />
            </IconButton>
          )}
          {!isConnected && !isConnecting && (
            <IconButton variant="ghost" size="xs" tooltip="Connect" tooltipSide="bottom" onClick={() => onConnect(server.name)}>
              <Plug size={13} />
            </IconButton>
          )}
          {isConnecting && (
            <span className="p-1.5">
              <AppLoaderGlyph size={13} />
            </span>
          )}
        </div>
      </div>
      {isExpanded && isConnected && (
        <McpToolList tools={tools} loading={loadingTools} />
      )}
    </div>
  )
}
