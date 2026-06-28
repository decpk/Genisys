import { useCallback, useEffect, useRef } from 'react'
import { RefreshCw } from 'lucide-react'

import { Tooltip } from '@/components/Tooltip'
import { AppInlineLoader } from '@/components/AppLoader'
import { ErrorMessage } from '@/components/ui/error-message'
import { useGitLog } from '../../hooks'
import { CommitItem } from './components/CommitItem'
import { CommitDateGroup } from './components/CommitDateGroup'
import { groupCommitsByDate } from './GitHistory.utils'
import type { GitHistoryProps } from './GitHistory.types'

export function GitHistory({ rootPath }: GitHistoryProps): React.JSX.Element {
  const { commits, totalCount, isLoading, isFetchingMore, hasMore, error, fetch, fetchMore } =
    useGitLog(rootPath)
  const hasFetched = useRef(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true
      fetch()
    }
  }, [fetch])

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0]?.isIntersecting && hasMore && !isFetchingMore && !isLoading) {
        fetchMore()
      }
    },
    [fetchMore, hasMore, isFetchingMore, isLoading]
  )

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(handleIntersection, {
      rootMargin: '100px'
    })
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [handleIntersection])

  if (isLoading && commits.length === 0) {
    return <AppInlineLoader size={16} className="py-4" message="Loading history…" />
  }

  if (error) {
    return <ErrorMessage message={error} />
  }

  if (commits.length === 0) {
    return (
      <div className="px-3 py-4 text-xs text-muted-foreground text-center">No commits found</div>
    )
  }

  const dateGroups = groupCommitsByDate(commits)

  return (
    <div className="flex flex-col">
      <div className="sticky top-0 z-30 flex items-center justify-between bg-background px-3 py-1.5 border-b border-border/40">
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
          {(() => {
            const display = totalCount ?? commits.length
            const suffix = totalCount === null && hasMore ? '+' : ''
            return `${display.toLocaleString()} commit${display !== 1 ? 's' : ''}${suffix}`
          })()}
        </span>
        <Tooltip content="Refresh" side="left">
          <button
            onClick={fetch}
            disabled={isLoading}
            className="p-0.5 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-30"
          >
            <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </Tooltip>
      </div>

      <div className="flex flex-col">
        {dateGroups.map((group) => (
          <CommitDateGroup key={group.label} label={group.label}>
            {group.commits.map((commit, idx) => (
              <CommitItem
                key={commit.hash}
                commit={commit}
                isLast={idx === group.commits.length - 1}
              />
            ))}
          </CommitDateGroup>
        ))}
      </div>

      <div ref={sentinelRef} className="h-1 shrink-0" />

      {isFetchingMore && (
        <div className="py-2">
          <AppInlineLoader size={12} message="Loading more…" className="py-16" />
        </div>
      )}

      {!hasMore && commits.length > 0 && (
        <div className="px-3 py-2 text-[10px] text-muted-foreground/50 text-center">
          End of history
        </div>
      )}
    </div>
  )
}
