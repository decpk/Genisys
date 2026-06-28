import { Highlighter } from 'lucide-react'

import { HighlightRow } from './HighlightRow'
import { useNotesHighlightsPanelData } from './useNotesHighlightsPanelData'
import {
  emptyStateHintStyles,
  emptyStateStyles,
  emptyStateTitleStyles,
  headerBadgeStyles,
  headerLabelStyles,
  headerStyles,
  listContainerStyles,
  listStyles,
} from './NotesHighlightsPanel.styles'

export function NotesHighlightsPanel(): React.JSX.Element {
  const { highlights, noteTitle, expandedId, toggleExpanded, onNavigate, onRemove } =
    useNotesHighlightsPanelData()

  if (highlights.length === 0) {
    return (
      <div className={emptyStateStyles}>
        <Highlighter size={20} className="mb-2" />
        <span className={emptyStateTitleStyles}>No highlights yet</span>
        <span className={emptyStateHintStyles}>
          Select text and click the highlight button
        </span>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className={headerStyles}>
        <Highlighter size={12} className="text-primary/60" />
        <span className={headerLabelStyles}>Highlights</span>
        <span className={headerBadgeStyles}>{highlights.length}</span>
      </div>

      <div className={listContainerStyles}>
        <div className={listStyles}>
          {highlights.map((highlight) => {
            const isExpanded = expandedId === highlight.id

            return (
              <HighlightRow
                key={highlight.id}
                highlight={highlight}
                noteTitle={noteTitle}
                isExpanded={isExpanded}
                onToggle={() => toggleExpanded(highlight.id)}
                onNavigate={() => onNavigate(highlight)}
                onRemove={() => onRemove(highlight)}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
