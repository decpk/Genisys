import { useState } from 'react'
import { ChevronDown, ChevronRight, Square } from 'lucide-react'
import type { RunningServerInfo } from '@/components/MockServer/MockServer.types'
import { cn } from '@/lib/utils'
import { IconButton } from '@/components/ui/icon-button'

interface RunningServersSectionProps {
  runningServers: RunningServerInfo[]
  selectedServerId: string | null
  onSelectServer: (serverId: string) => void
  onStopServer: (serverId: string) => void
}

export function RunningServersSection(props: RunningServersSectionProps) {
  const { runningServers, selectedServerId, onSelectServer, onStopServer } = props
  const [isExpanded, setIsExpanded] = useState(true)

  if (runningServers.length === 0) return null

  const ChevronIcon = isExpanded ? ChevronDown : ChevronRight

  return (
    <div className="mb-1.5">
      <button
        type="button"
        className="flex w-full items-center gap-2 px-2.5 py-1.5 cursor-pointer hover:bg-accent/50 rounded-lg"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <ChevronIcon className="size-3.5 text-muted-foreground/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Running ({runningServers.length})
        </span>
      </button>

      {isExpanded && (
        <div className="mt-0.5 ml-2.5">
          {runningServers.map((rs) => {
            const isSelected = selectedServerId === rs.server_id

            return (
              <div
                key={rs.server_id}
                className={cn(
                  "group flex items-center gap-2.5 px-2 py-2 rounded-md text-xs font-medium cursor-pointer transition-colors",
                  isSelected
                    ? "bg-muted/50 border border-border/40 text-foreground"
                    : "border border-transparent hover:bg-secondary/60 text-muted-foreground hover:text-foreground",
                )}
                onClick={() => onSelectServer(rs.server_id)}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" />
                <span className="truncate flex-1">{rs.name}</span>
                <span className="text-[11px] text-muted-foreground/70 bg-muted/50 px-1.5 py-0.5 rounded">
                  :{rs.port}
                </span>
                <IconButton
                  size="xs"
                  variant="destructive"
                  tooltip="Stop server"
                  className="opacity-0 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStopServer(rs.server_id);
                  }}
                >
                  <Square className="size-3" />
                </IconButton>
              </div>
            );
          })}
        </div>
      )}
    </div>
  )
}
