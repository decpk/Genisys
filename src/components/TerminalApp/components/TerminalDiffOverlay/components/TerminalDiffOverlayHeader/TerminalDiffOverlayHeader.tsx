import { X } from 'lucide-react'

import { getFileIcon } from '@/lib/file-icons'
import { Kbd } from '@/components/ui/kbd'
import { Tooltip } from '@/components/Tooltip'

import { terminalDiffOverlayStyles as s } from '../../TerminalDiffOverlay.styles'
import type { TerminalDiffOverlayHeaderProps } from './TerminalDiffOverlayHeader.types'

/** Diff overlay header: file path + Esc hint + close button. */
export function TerminalDiffOverlayHeader(props: TerminalDiffOverlayHeaderProps) {
  const { filePath, onClose } = props
  const fileName = filePath.split('/').pop() ?? filePath

  return (
    <div className={s.header}>
      <span className={s.headerIcon}>{getFileIcon(fileName, false, 14)}</span>
      <span className={s.headerPath}>{filePath}</span>
      <div className={s.headerActions}>
        <Kbd shortcut="Esc" variant="inline" size="sm" />
        <Tooltip content="Close diff" side="bottom">
          <button
            type="button"
            className={s.closeBtn}
            onClick={onClose}
            aria-label="Close diff"
          >
            <X size={15} />
          </button>
        </Tooltip>
      </div>
    </div>
  )
}
