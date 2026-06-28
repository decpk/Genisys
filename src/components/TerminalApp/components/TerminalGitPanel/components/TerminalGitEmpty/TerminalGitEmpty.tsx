import { AlertCircle, CheckCircle2, FolderGit2, GitBranch } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { terminalGitPanelStyles as s } from '../../TerminalGitPanel.styles'
import type {
  TerminalGitEmptyProps,
  TerminalGitEmptyVariant,
} from './TerminalGitEmpty.types'

const EMPTY_CONTENT: Record<
  TerminalGitEmptyVariant,
  { icon: LucideIcon; text: string }
> = {
  'no-cwd': {
    icon: FolderGit2,
    text: 'Waiting for the terminal’s working directory…',
  },
  'not-repo': { icon: GitBranch, text: 'This folder is not a git repository.' },
  clean: { icon: CheckCircle2, text: 'No changes — working tree is clean.' },
  error: { icon: AlertCircle, text: 'Could not read git status.' },
}

/** Centered empty / status placeholder for the git panel body. */
export function TerminalGitEmpty(props: TerminalGitEmptyProps) {
  const { variant, message } = props
  const content = EMPTY_CONTENT[variant]
  const Icon = content.icon
  const text = message ?? content.text

  return (
    <div className={s.empty}>
      <Icon size={26} className={s.emptyIcon} />
      <p className={s.emptyText}>{text}</p>
    </div>
  )
}
