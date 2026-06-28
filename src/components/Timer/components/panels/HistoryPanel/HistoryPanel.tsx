import { History } from 'lucide-react'

import { AppLoaderGlyph } from '@/components/AppLoader'
import { HistoryFilterBar } from './components/HistoryFilterBar'
import { HistorySessionGroup } from './components/HistorySessionGroup'
import { HistoryStatsHeader } from './components/HistoryStatsHeader'
import { useHistoryPanelData } from './hooks/useHistoryPanelData'
import { computeHistoryStats } from './utils/computeHistoryStats'

export function HistoryPanel(): React.JSX.Element {
  const data = useHistoryPanelData()
  const stats = computeHistoryStats(data.sessions)
  const hasAnyFilter = data.filter.search.length > 0 || data.filter.tagId != null

  let body: React.ReactNode = null
  if (data.isLoading && data.sessions.length === 0) {
    body = (
      <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
        <AppLoaderGlyph size={20} className="opacity-70" />
        <span className="text-xs">Loading sessions…</span>
      </div>
    )
  } else if (data.error) {
    body = (
      <div className="mx-3 mt-3 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-xs text-destructive">
        {data.error}
      </div>
    )
  } else if (data.groups.length === 0) {
    body = (
      <div className="flex flex-col items-center justify-center gap-2 py-12 px-6 text-center">
        <div className="flex size-10 items-center justify-center rounded-full bg-muted/50 text-muted-foreground">
          <History size={18} />
        </div>
        <p className="text-sm font-medium text-foreground">
          {hasAnyFilter ? 'No matching sessions' : 'No sessions yet'}
        </p>
        <p className="text-[11px] text-muted-foreground max-w-[220px]">
          {hasAnyFilter
            ? 'Try clearing your filters to see more results.'
            : 'Complete a timer session and it will appear here.'}
        </p>
      </div>
    )
  } else {
    body = (
      <div className="flex flex-col pb-3">
        {data.groups.map((g) => (
          <HistorySessionGroup
            key={g.dateKey}
            group={g}
            onDelete={(id) => void data.remove(id)}
          />
        ))}
        {data.hasMore && (
          <div className="px-3 mt-3">
            <button
              type="button"
              onClick={data.loadMore}
              className="w-full rounded-md border border-border/50 bg-muted/30 hover:bg-muted/60 hover:border-border/70 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Load more
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-muted/20">
      <HistoryStatsHeader stats={stats} />
      <HistoryFilterBar
        search={data.filter.search}
        tagId={data.filter.tagId}
        tags={data.tags}
        onSearch={data.setSearch}
        onTagChange={data.setTagId}
        onReset={data.reset}
      />
      <div className="flex-1 overflow-y-auto">{body}</div>
    </div>
  )
}
