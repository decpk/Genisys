import { Download, Check } from 'lucide-react'
import { AppInlineLoader } from '@/components/AppLoader'
import { Button } from '@/components/ui/button'

import type { McpSyncResult, McpSyncState } from '../../Onboarding.types'

interface StepMcpProps {
  syncState: McpSyncState
  syncResult: McpSyncResult | null
  syncError: string | null
  onSync: () => void
  onSkip: () => void
}

export function StepMcp(props: StepMcpProps): React.JSX.Element {
  const { syncState, syncResult, syncError, onSync, onSkip } = props

  const isDone = syncState === 'done' || syncState === 'skipped'

  let actionContent: React.ReactNode = null

  if (syncState === 'idle') {
    actionContent = (
      <div className="mt-8 flex flex-col items-center gap-4">
        <Button onClick={onSync} variant="outline" size="lg" className="px-8 gap-2.5 rounded-xl h-11">
          <Download size={18} />
          Scan & Import
        </Button>
        <Button variant="link" size="sm" onClick={onSkip} className="text-muted-foreground/40 hover:text-muted-foreground/70 hover:no-underline">
          Skip this step
        </Button>
      </div>
    )
  }

  if (syncState === 'syncing') {
    actionContent = (
      <div className="mt-8">
        <AppInlineLoader message="Scanning VS Code..." size={16} />
      </div>
    )
  }

  if (syncState === 'done' && syncResult) {
    const hasAdded = syncResult.added.length > 0
    actionContent = (
      <div className="mt-8 flex flex-col items-center gap-3">
        <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center mb-1">
          <Check size={28} className="text-green-500" />
        </div>
        <p className="text-sm text-foreground">
          {hasAdded
            ? `Imported ${syncResult.added.length} server${syncResult.added.length > 1 ? 's' : ''}`
            : 'No new servers found'}
        </p>
        {hasAdded && (
          <div className="flex flex-wrap justify-center gap-1.5 max-w-md">
            {syncResult.added.map((name) => (
              <span key={name} className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-green-500/10 text-green-500 text-xs font-medium">
                {name}
              </span>
            ))}
          </div>
        )}
        {syncResult.skipped.length > 0 && (
          <p className="text-xs text-muted-foreground/50">{syncResult.skipped.length} already imported</p>
        )}
      </div>
    )
  }

  if (syncState === 'error' && syncError) {
    actionContent = (
      <div className="mt-8 flex flex-col items-center gap-3">
        <p className="text-sm text-destructive">{syncError}</p>
        <div className="flex gap-2">
          <Button onClick={onSync} variant="outline" size="sm" className="gap-2 rounded-xl">
            Retry
          </Button>
          <Button onClick={onSkip} variant="ghost" size="sm" className="rounded-xl">
            Skip
          </Button>
        </div>
      </div>
    )
  }

  if (syncState === 'skipped') {
    actionContent = (
      <div className="mt-8 flex flex-col items-center gap-1">
        <div className="w-14 h-14 rounded-full bg-muted/30 flex items-center justify-center mb-2">
          <Check size={28} className="text-muted-foreground/50" />
        </div>
        <p className="text-sm text-muted-foreground/50">Skipped</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="w-20 h-20 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex items-center justify-center mb-8">
        <Download size={36} className="text-blue-400" />
      </div>

      <h2 className="text-3xl font-bold tracking-tight text-foreground">
        Import MCP Servers
      </h2>
      <p className="text-base text-muted-foreground/50 mt-3 max-w-md font-light leading-relaxed">
        Discover and import MCP servers from VS Code and Cursor.
      </p>

      {actionContent}
    </div>
  )
}
