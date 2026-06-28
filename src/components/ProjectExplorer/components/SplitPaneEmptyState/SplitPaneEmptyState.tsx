import { FolderOpen } from 'lucide-react'

import { RepoHistory } from '../RepoHistory'
import type { SplitPaneEmptyStateProps } from './SplitPaneEmptyState.types'

export function SplitPaneEmptyState({ onSelect, activePanes }: SplitPaneEmptyStateProps): React.JSX.Element {
  return (
    <div className="flex-1 overflow-y-auto flex flex-col items-center pt-8 pb-4">
      <div className="flex flex-col items-center gap-2 mb-5">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-muted/50 border border-border/30">
          <FolderOpen size={18} className="text-muted-foreground/40" />
        </div>
        <p className="text-xs text-muted-foreground text-center max-w-[240px] leading-relaxed">
          Select a repository from history or add a new one
        </p>
      </div>
      <div className="w-full max-w-sm px-4">
        <RepoHistory onSelect={onSelect} activePanes={activePanes} />
      </div>
    </div>
  )
}
