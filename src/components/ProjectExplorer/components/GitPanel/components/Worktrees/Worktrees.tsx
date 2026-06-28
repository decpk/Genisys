import { useEffect, useRef } from 'react'
import { RefreshCw } from 'lucide-react'

import { Tooltip } from '@/components/Tooltip'
import { AppInlineLoader } from '@/components/AppLoader'
import { ErrorMessage } from '@/components/ui/error-message'
import { useGitWorktrees } from '../../hooks'
import { WorktreeItem } from './components/WorktreeItem'
import type { WorktreesProps } from './Worktrees.types'

export function Worktrees({ rootPath }: WorktreesProps): React.JSX.Element {
  const { worktrees, isLoading, error, fetch } = useGitWorktrees(rootPath)
  const hasFetched = useRef(false)

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true
      fetch()
    }
  }, [fetch])

  if (isLoading && worktrees.length === 0) {
    return <AppInlineLoader size={16} className="py-4" message="Loading worktrees…" />
  }

  if (error) {
    return <ErrorMessage message={error} />
  }

  if (worktrees.length === 0) {
    return (
      <div className="px-3 py-4 text-xs text-muted-foreground text-center">No worktrees found</div>
    )
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border/20">
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
          {worktrees.length} worktree{worktrees.length !== 1 ? 's' : ''}
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
      {worktrees.map((wt) => (
        <WorktreeItem key={wt.path} worktree={wt} />
      ))}
    </div>
  )
}
