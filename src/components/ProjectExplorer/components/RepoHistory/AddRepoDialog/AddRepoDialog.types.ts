import type { RepoInfo } from '../../../ProjectExplorer.types'

export interface AddRepoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (repo: RepoInfo) => void
}
