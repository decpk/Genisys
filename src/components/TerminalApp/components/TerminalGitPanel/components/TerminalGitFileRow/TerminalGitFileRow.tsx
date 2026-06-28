import { ChevronRight } from 'lucide-react'

import { getFileIcon } from '@/lib/file-icons'
import { CATEGORY_STYLES } from '@/components/ProjectExplorer/components/GitPanel/GitPanel.constants'
import { cn } from '@/lib/utils'

import { terminalGitPanelStyles as s } from '../../TerminalGitPanel.styles'
import type { TerminalGitFileRowProps } from './TerminalGitFileRow.types'

/** A single clickable changed-file row that opens the diff overlay on click. */
export function TerminalGitFileRow(props: TerminalGitFileRowProps) {
  const { file, category, onOpen } = props
  const fileName = file.path.split('/').pop() ?? file.path
  const hasDir = file.path.includes('/')
  const dirPath = hasDir ? file.path.slice(0, file.path.lastIndexOf('/')) : ''
  const style = CATEGORY_STYLES[category]

  return (
    <button
      type="button"
      className={s.row}
      onClick={() => onOpen(file)}
      title={file.path}
    >
      <span className={s.rowIcon}>{getFileIcon(fileName, false, 14)}</span>
      <span className={s.rowText}>
        <span className={s.rowName}>{fileName}</span>
        {dirPath && <span className={s.rowDir}>{dirPath}</span>}
      </span>
      <ChevronRight size={12} className={s.rowChevron} />
      <span className={cn(s.badge, style.badgeClass)}>{style.label.charAt(0)}</span>
    </button>
  )
}
