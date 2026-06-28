import { ArrowLeftRight, Columns2, Rows2, X } from 'lucide-react'

import { cn } from '@/lib/utils'
import { IconButton } from '@/components/ui/icon-button'
import { Tooltip } from '@/components/Tooltip'

import { notesMainContentStyles as styles } from '../../../NotesMainContent.styles'
import type { NotesSplitControlsProps } from './NotesSplitControls.types'

export function NotesSplitControls(props: NotesSplitControlsProps): React.JSX.Element {
  const { orientation, onToggleOrientation, onSwap, onClose } = props

  const isSideBySide = orientation === 'side-by-side'
  const orientationTooltip = isSideBySide ? 'Stack panes (top / bottom)' : 'Place panes side by side'
  const orientationIcon = isSideBySide ? <Rows2 size={13} /> : <Columns2 size={13} />
  const btnClass = cn(styles.toolbarBtn, 'w-7', styles.toolbarBtnIdle)

  return (
    <div className="inline-flex items-center gap-1">
      <Tooltip content={orientationTooltip} side="bottom">
        <IconButton variant="ghost" size="sm" onClick={onToggleOrientation} className={btnClass}>
          {orientationIcon}
        </IconButton>
      </Tooltip>

      <Tooltip content="Swap panes" side="bottom">
        <IconButton variant="ghost" size="sm" onClick={onSwap} className={btnClass}>
          <ArrowLeftRight size={13} />
        </IconButton>
      </Tooltip>

      <Tooltip content="Close split pane" side="bottom">
        <IconButton variant="ghost" size="sm" onClick={onClose} className={btnClass}>
          <X size={13} />
        </IconButton>
      </Tooltip>
    </div>
  )
}
