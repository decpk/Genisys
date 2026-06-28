import type { GitCommit } from '../../../../GitPanel.types'

export interface CommitHoverCardProps {
  commit: GitCommit
  children: React.ReactNode
}

export interface CommitHoverCardContentProps {
  commit: GitCommit
}
