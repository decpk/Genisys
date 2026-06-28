import { Clock, FolderGit2 } from 'lucide-react'

import { EmptyState } from '@/components/ui/empty-state'
import { repoKey } from '../RepoHistory.hooks'
import { RepoHistoryItem } from '../RepoHistoryItem'
import type { RepoHistoryListProps } from './RepoHistoryList.types'

export function RepoHistoryList({
  isLoaded,
  filtered,
  totalCount,
  activeRepoMap,
  hasMultiplePanes,
  onSelect,
  onRemove
}: RepoHistoryListProps): React.JSX.Element {
  if (!isLoaded) {
    return <EmptyState icon={Clock} message="Loading…" className="py-12" />
  }

  if (filtered.length === 0) {
    const message = totalCount === 0 ? 'No repositories yet' : 'No matches'
    return <EmptyState icon={FolderGit2} message={message} className="py-12" />
  }

  return (
    <div className="flex flex-col gap-px">
      {filtered.map((repo) => {
        const key = repoKey(repo)
        return (
          <RepoHistoryItem
            key={key}
            repo={repo}
            isActive={!!activeRepoMap.get(key)}
            paneNumbers={activeRepoMap.get(key)}
            hasMultiplePanes={hasMultiplePanes}
            onSelect={onSelect}
            onRemove={onRemove}
          />
        )
      })}
    </div>
  )
}
