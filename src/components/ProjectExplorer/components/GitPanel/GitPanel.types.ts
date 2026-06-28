export interface GitStatusFile {
  indexStatus: string
  workTreeStatus: string
  path: string
}

export interface GitCommit {
  hash: string
  authorName: string
  authorEmail: string
  date: string
  message: string
  refs: string
}

export interface GitWorktree {
  path: string
  head: string
  branch: string
  isBare: boolean
}

export interface GitPanelProps {
  rootPath: string
  isOpen: boolean
  onClose: () => void
}

export type GitChangeCategory = 'modified' | 'added' | 'deleted' | 'renamed' | 'untracked'
