import { memo } from 'react'
import { Pin, Trash2 } from 'lucide-react'

import { IconButton } from '@/components/ui/icon-button'
import { noteItemStyles } from '../Notes.styles'
import type { NoteItemProps } from './NoteItem.types'

function NoteItemComponent(props: NoteItemProps): React.JSX.Element {
  const { note, isActive, onSelect, onDelete, onTogglePin, showSeparator } = props

  const stateClass = isActive ? noteItemStyles.active : noteItemStyles.idle
  const displayTitle = note.title || 'Untitled'
  const titleClass = note.title ? noteItemStyles.title : noteItemStyles.titleEmpty

  const formattedDate = new Date(note.updatedAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })

  return (
    <>
      {showSeparator && <div className={noteItemStyles.separator} />}
      <button
        onClick={() => onSelect(note.id)}
        className={`${noteItemStyles.base} ${stateClass}`}
      >
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <p className={titleClass}>{displayTitle}</p>
            <div className={noteItemStyles.meta}>
              <span className={noteItemStyles.timestamp}>{formattedDate}</span>
              {note.isPinned && <Pin size={10} className={noteItemStyles.pinIndicator} />}
            </div>
          </div>
          <div className={noteItemStyles.actions}>
            <IconButton
              variant="ghost"
              size="xs"
              onClick={(e) => {
                e.stopPropagation()
                onTogglePin(note.id)
              }}
              tooltip={note.isPinned ? 'Unpin' : 'Pin'}
              className={noteItemStyles.actionButton}
            >
              <Pin size={11} />
            </IconButton>
            <IconButton
              variant="ghost"
              size="xs"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(note.id)
              }}
              tooltip="Delete"
              className={noteItemStyles.actionButton}
            >
              <Trash2 size={11} />
            </IconButton>
          </div>
        </div>
      </button>
    </>
  )
}

export const NoteItem = memo(NoteItemComponent)
