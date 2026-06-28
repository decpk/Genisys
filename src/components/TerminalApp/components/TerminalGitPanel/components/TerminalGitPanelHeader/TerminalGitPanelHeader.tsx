import { GitBranch, RefreshCw, X } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Tooltip } from '@/components/Tooltip'

import { terminalGitPanelStyles as s } from '../../TerminalGitPanel.styles'
import type { TerminalGitPanelHeaderProps } from './TerminalGitPanelHeader.types'

/** Header row: folder name, change count, and refresh + hide actions. */
export function TerminalGitPanelHeader(props: TerminalGitPanelHeaderProps) {
  const { title, count, isLoading, onRefresh, onClose } = props
  const showCount = count > 0

  return (
    <div className={s.header}>
      <GitBranch size={14} className={s.headerIcon} />
      <span className={s.headerTitle}>{title}</span>
      {showCount && <span className={s.countPill}>{count}</span>}
      <div className={s.headerActions}>
        <Tooltip content="Refresh changes" side="bottom">
          <button
            type="button"
            className={s.iconBtn}
            onClick={onRefresh}
            disabled={isLoading}
            aria-label="Refresh git changes"
          >
            <RefreshCw size={13} className={cn(isLoading && s.spin)} />
          </button>
        </Tooltip>
        <Tooltip content="Hide git panel" side="bottom">
          <button
            type="button"
            className={s.iconBtn}
            onClick={onClose}
            aria-label="Hide git panel"
          >
            <X size={14} />
          </button>
        </Tooltip>
      </div>
    </div>
  )
}
