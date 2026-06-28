import type { GitCommit } from '../../../../GitPanel.types'

export interface CommitItemProps {
  commit: GitCommit
  isLast?: boolean
}
