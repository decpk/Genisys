import { FolderGit2, GitBranch } from 'lucide-react'

import { Tooltip } from '@/components/Tooltip'
import type { WorktreeItemProps } from './WorktreeItem.types'

export function WorktreeItem({ worktree }: WorktreeItemProps): React.JSX.Element {
  const dirName = worktree.path.split('/').pop() ?? worktree.path
  const shortHead = worktree.head.slice(0, 7)

  return (
    <div className="flex items-start gap-2 px-3 py-1.5 hover:bg-secondary transition-colors text-xs min-w-0">
      <FolderGit2 size={14} className="shrink-0 mt-0.5 text-info" />
      <div className="flex flex-col min-w-0 flex-1">
        <span className="truncate text-foreground leading-tight font-medium">
          {dirName}
        </span>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/70 leading-tight mt-0.5">
          {worktree.branch ? (
            <>
              <GitBranch size={10} className="shrink-0" />
              <span className="truncate">{worktree.branch}</span>
            </>
          ) : worktree.isBare ? (
            <span className="italic">bare</span>
          ) : (
            <Tooltip content={worktree.head} side="left">
              <span className="cursor-default">{shortHead} (detached)</span>
            </Tooltip>
          )}
        </div>
        <span className="truncate text-[10px] text-muted-foreground/50 leading-tight mt-0.5">
          {worktree.path}
        </span>
      </div>
    </div>
  );
}
