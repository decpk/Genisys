import { memo } from 'react'
import { ChevronDown, ChevronRight, Trash2 } from 'lucide-react'

import { formatRelativeTime } from '../utils/formatRelativeTime'
import type { HighlightRowProps } from './HighlightRow.types'
import {
  chevronButtonStyles,
  detailGridStyles,
  detailLabelStyles,
  detailStyles,
  detailTextStyles,
  detailValueStyles,
  metaTextStyles,
  removeButtonStyles,
  rowHeaderStyles,
  rowStyles,
  snippetButtonStyles,
  snippetTextStyles,
} from './HighlightRow.styles'

function HighlightRowComponent(props: HighlightRowProps): React.JSX.Element {
  const { highlight, noteTitle, isExpanded, onToggle, onNavigate, onRemove } = props

  const ChevronIcon = isExpanded ? ChevronDown : ChevronRight
  const relativeTime = formatRelativeTime(highlight.createdAt)
  const createdAbsolute = new Date(highlight.createdAt).toLocaleString()
  const title = noteTitle || 'Untitled'
  const rangeText = `${highlight.fromPos}–${highlight.toPos}`
  const lengthText = `${highlight.text.length} chars`
  const annotation = highlight.note.trim()
  const hasAnnotation = annotation.length > 0

  const handleChevronClick = (e: React.MouseEvent): void => {
    e.stopPropagation()
    onToggle()
  }

  const handleRemoveClick = (e: React.MouseEvent): void => {
    e.stopPropagation()
    onRemove()
  }

  return (
    <div className={rowStyles}>
      <div className={rowHeaderStyles}>
        <button
          type="button"
          onClick={handleChevronClick}
          className={chevronButtonStyles}
          aria-label={isExpanded ? 'Collapse highlight' : 'Expand highlight'}
        >
          <ChevronIcon size={12} />
        </button>

        <button type="button" onClick={onNavigate} className={snippetButtonStyles}>
          <span className={snippetTextStyles}>{highlight.text}</span>
          <span className={metaTextStyles}>{relativeTime}</span>
        </button>

        <button
          type="button"
          onClick={handleRemoveClick}
          className={removeButtonStyles}
          aria-label="Delete highlight"
        >
          <Trash2 size={12} />
        </button>
      </div>

      {isExpanded && (
        <div className={detailStyles}>
          <span className={detailTextStyles}>{highlight.text}</span>

          <div className={detailGridStyles}>
            <span className={detailLabelStyles}>Created</span>
            <span className={detailValueStyles}>{createdAbsolute}</span>

            <span className={detailLabelStyles}>Page</span>
            <span className={detailValueStyles}>{title}</span>

            <span className={detailLabelStyles}>Range</span>
            <span className={detailValueStyles}>{rangeText}</span>

            <span className={detailLabelStyles}>Length</span>
            <span className={detailValueStyles}>{lengthText}</span>

            {hasAnnotation && (
              <>
                <span className={detailLabelStyles}>Note</span>
                <span className={detailValueStyles}>{annotation}</span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export const HighlightRow = memo(HighlightRowComponent)
