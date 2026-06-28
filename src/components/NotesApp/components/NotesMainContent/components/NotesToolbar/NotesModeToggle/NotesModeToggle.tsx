import { Eye, Pencil } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Tooltip } from '@/components/Tooltip'

import type { NotesModeToggleProps } from './NotesModeToggle.types'

const SEGMENT_BASE =
  'inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] transition-colors'
const SEGMENT_ACTIVE = 'bg-primary/10 text-primary'
const SEGMENT_IDLE = 'text-muted-foreground hover:text-foreground'

export function NotesModeToggle(props: NotesModeToggleProps): React.JSX.Element {
  const { mode, onModeChange, isCompact } = props

  const viewClass = cn(SEGMENT_BASE, mode === 'view' ? SEGMENT_ACTIVE : SEGMENT_IDLE)
  const editClass = cn(SEGMENT_BASE, mode === 'edit' ? SEGMENT_ACTIVE : SEGMENT_IDLE)

  return (
    <div className="inline-flex items-center rounded-md border border-border/50 bg-secondary/30 p-0.5">
      <Tooltip content="View mode (read-only)" side="bottom">
        <button
          type="button"
          onClick={() => onModeChange('view')}
          className={viewClass}
          aria-pressed={mode === 'view'}
        >
          <Eye size={12} />
          {!isCompact && <span>View</span>}
        </button>
      </Tooltip>

      <Tooltip content="Edit mode (⇧⌘E)" side="bottom">
        <button
          type="button"
          onClick={() => onModeChange('edit')}
          className={editClass}
          aria-pressed={mode === 'edit'}
        >
          <Pencil size={12} />
          {!isCompact && <span>Edit</span>}
        </button>
      </Tooltip>
    </div>
  )
}
