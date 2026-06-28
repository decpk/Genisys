import type {
  GitChangeCategory,
  GitStatusFile,
} from '@/components/ProjectExplorer/components/GitPanel/GitPanel.types'

export interface TerminalGitFileRowProps {
  file: GitStatusFile
  category: GitChangeCategory
  onOpen: (file: GitStatusFile) => void
}
