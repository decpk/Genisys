import { Maximize2, Minimize2 } from 'lucide-react'

import { cn } from '@/lib/utils'
import { IconButton } from '@/components/ui/icon-button'
import { Tooltip } from '@/components/Tooltip'

import { notesMainContentStyles as styles } from '../../../NotesMainContent.styles'
import type { NotesFullscreenButtonProps } from './NotesFullscreenButton.types'

export function NotesFullscreenButton(props: NotesFullscreenButtonProps): React.JSX.Element {
  const { distractionFree, toggleDistractionFree } = props

  const tooltip = distractionFree ? 'Exit full screen (⇧⌘F)' : 'Full screen (⇧⌘F)'
  const stateClass = distractionFree ? styles.toolbarBtnActive : styles.toolbarBtnIdle
  const icon = distractionFree ? <Minimize2 size={13} /> : <Maximize2 size={13} />

  return (
    <Tooltip content={tooltip} side="bottom">
      <IconButton
        variant="ghost"
        size="sm"
        onClick={toggleDistractionFree}
        className={cn(styles.toolbarBtn, 'w-7', stateClass)}
      >
        {icon}
      </IconButton>
    </Tooltip>
  )
}
