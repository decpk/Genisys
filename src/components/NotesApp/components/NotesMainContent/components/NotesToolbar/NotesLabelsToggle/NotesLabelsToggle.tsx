import { Tag } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Tooltip } from '@/components/Tooltip'

import { notesMainContentStyles as styles } from '../../../NotesMainContent.styles'
import type { NotesLabelsToggleProps } from './NotesLabelsToggle.types'

export function NotesLabelsToggle(props: NotesLabelsToggleProps): React.JSX.Element {
  const { showLabels, labelCount, isCompact, onToggle } = props

  const plural = labelCount === 1 ? '' : 's'
  const tooltip = showLabels
    ? 'Hide labels (⇧⌘L)'
    : `${labelCount} label${plural} hidden (⇧⌘L)`
  const stateClass = showLabels ? styles.toolbarBtnActive : styles.toolbarBtnIdle
  const showCount = !isCompact && labelCount > 0

  return (
    <Tooltip content={tooltip} side="bottom">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onToggle}
        className={cn(styles.toolbarBtn, 'px-2 gap-1', stateClass)}
      >
        <Tag size={12} />
        {showCount && <span>{labelCount}</span>}
      </Button>
    </Tooltip>
  )
}
