import type { GitChangeCategory, GitStatusFile } from '../../GitPanel.types'

export interface GitFileItemProps {
  file: GitStatusFile
  category: GitChangeCategory
}
