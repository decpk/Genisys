import { Download, Check, AlertCircle, SkipForward } from 'lucide-react'
import { AppInlineLoader } from '@/components/AppLoader'

import { Button } from '@/components/ui/button'

import type { McpSyncResult, McpSyncState } from '../../Onboarding.types'

interface McpSyncSectionProps {
  syncState: McpSyncState
  syncResult: McpSyncResult | null
  syncError: string | null
  onSync: () => void
  onSkip: () => void
}

export function McpSyncSection(props: McpSyncSectionProps): React.JSX.Element {
  const { syncState, syncResult, syncError, onSync, onSkip } = props

  const isDone = syncState === 'done' || syncState === 'skipped'
  const cardClass = isDone
    ? 'rounded-2xl border border-green-500/15 bg-green-500/[0.03] p-5 flex flex-col items-center text-center transition-all duration-500'
    : 'rounded-2xl border border-border/20 bg-card/30 p-5 flex flex-col items-center text-center transition-all duration-500'

  const iconBg = isDone ? 'bg-green-500/10' : 'bg-muted/50'

  let statusContent: React.ReactNode = null

  if (syncState === 'idle') {
    statusContent = (
      <div className="w-full mt-4 space-y-2">
        <Button onClick={onSync} variant="outline" size="sm" className="w-full rounded-lg">
          <Download size={14} />
          Scan & Import
        </Button>
        <Button variant="link" size="xs" onClick={onSkip} className="text-[11px] text-muted-foreground/40 hover:text-muted-foreground/70 hover:no-underline">
          Skip this step
        </Button>
      </div>
    )
  }

  if (syncState === 'syncing') {
    statusContent = (
      <div className="pt-3">
        <AppInlineLoader message="Scanning..." size={12} />
      </div>
    )
  }

  if (syncState === 'done' && syncResult) {
    statusContent = (
      <div className="mt-3">
        <McpSyncResultDisplay result={syncResult} />
      </div>
    )
  }

  if (syncState === 'error' && syncError) {
    statusContent = (
      <div className="w-full mt-3 space-y-2">
        <p className="text-xs text-destructive">{syncError}</p>
        <div className="flex gap-2">
          <Button onClick={onSync} variant="outline" size="sm" className="flex-1 rounded-lg">
            Retry
          </Button>
          <Button onClick={onSkip} variant="ghost" size="sm" className="rounded-lg">
            Skip
          </Button>
        </div>
      </div>
    )
  }

  if (syncState === 'skipped') {
    statusContent = (
      <p className="text-xs text-green-500/80 mt-3">Skipped</p>
    )
  }

  return (
    <div className={cardClass}>
      <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center`}>
        {isDone
          ? <Check size={18} className="text-green-500" />
          : <Download size={18} className="text-blue-400" />
        }
      </div>
      <h3 className="text-[13px] font-semibold text-foreground mt-3">MCP Servers</h3>
      <p className="text-[11px] text-muted-foreground/50 leading-relaxed mt-1">
        Import from VS Code, Insiders & Cursor
      </p>
      {statusContent}
    </div>
  )
}

function McpSyncResultDisplay(props: { result: McpSyncResult }): React.JSX.Element {
  const { result } = props
  const hasAdded = result.added.length > 0

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm">
        <Check size={14} className="text-green-500" />
        <span className="text-foreground">
          {hasAdded
            ? `Added ${result.added.length} server${result.added.length > 1 ? 's' : ''}`
            : 'No new servers found'}
        </span>
      </div>

      {hasAdded && (
        <div className="flex flex-wrap gap-1.5">
          {result.added.map((name) => (
            <span
              key={name}
              className="inline-flex items-center px-2 py-0.5 rounded-md bg-green-500/10 text-green-500 text-xs font-medium"
            >
              {name}
            </span>
          ))}
        </div>
      )}

      {result.skipped.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {result.skipped.length} already imported
        </p>
      )}

      <p className="text-xs text-muted-foreground">
        Connected {result.connected} of {result.connected + result.failed} servers
      </p>
    </div>
  )
}
