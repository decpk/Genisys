import type {
  GitStatusFile,
} from '@/components/ProjectExplorer/components/GitPanel/GitPanel.types'

export interface TerminalGitPanelProps {
  /** Id of the pane (leaf) this panel is docked to — anchors the diff overlay. */
  leafId: string
  /** Live working directory of the pane's active tab; drives the git status. */
  cwd: string | null
}

/** Normalised `git status` payload for a folder. */
export interface TerminalGitStatusData {
  gitRoot: string
  files: GitStatusFile[]
}

/** View model returned by `useTerminalGitPanelData` and consumed by the views. */
export interface TerminalGitPanelData {
  /** Folder name shown in the header. */
  title: string
  /** Total number of changed files. */
  count: number
  cwd: string | null
  isRepo: boolean
  isLoading: boolean
  error: string | null
  files: GitStatusFile[]
  staged: GitStatusFile[]
  unstaged: GitStatusFile[]
  /** Per-section collapse map keyed by section id (`staged` / `unstaged`). */
  collapsed: Record<string, boolean>
  toggleSection: (key: string) => void
  onFileClick: (file: GitStatusFile) => void
  onRefresh: () => void
  onClose: () => void
}
