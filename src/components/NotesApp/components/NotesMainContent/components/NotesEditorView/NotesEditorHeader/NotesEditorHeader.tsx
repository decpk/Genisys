import { Plus, X } from 'lucide-react'
import { Popover } from 'radix-ui'

import { Button } from '@/components/ui/button'

import { notesMainContentStyles as styles } from '../../../NotesMainContent.styles'
import type { NotesEditorHeaderProps } from './NotesEditorHeader.types'

export function NotesEditorHeader(props: NotesEditorHeaderProps): React.JSX.Element {
  const {
    sourceInfo,
    showLabels,
    noteLabels,
    allLabels,
    isReadOnly,
    onToggleLabel,
    labelPopoverOpen,
    setLabelPopoverOpen,
    activeLabelIds,
  } = props

  return (
    <div className={styles.header}>
      {sourceInfo && (
        <div className={styles.sourceBadge}>
          Added from {sourceInfo.label}
          {sourceInfo.contextLabel && <span>· {sourceInfo.contextLabel}</span>}
        </div>
      )}

      {showLabels && (
        <div className={styles.labelRow}>
          {noteLabels.map((label) => {
            const style = label.color
              ? { backgroundColor: `${label.color}15`, color: label.color, borderColor: `${label.color}30` }
              : undefined
            return (
              <button
                key={label.id}
                type="button"
                onClick={() => {
                  if (isReadOnly) return
                  onToggleLabel(label.id)
                }}
                className={styles.labelBadgeActive}
                disabled={isReadOnly}
                style={style}
              >
                #{label.name}
                <X size={10} className="opacity-50" />
              </button>
            )
          })}

          {!isReadOnly && allLabels.length > 0 && (
            <Popover.Root open={labelPopoverOpen} onOpenChange={setLabelPopoverOpen}>
              <Popover.Trigger asChild>
                <Button type="button" variant="ghost" size="xs" className={styles.addLabelButton}>
                  <Plus size={10} />
                  Label
                </Button>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content align="start" sideOffset={6} className={styles.labelPopover}>
                  <div className={styles.labelPopoverHeader}>Toggle labels</div>
                  <div className={styles.labelPopoverList}>
                    {allLabels.map((label) => {
                      const isActive = activeLabelIds.has(label.id)
                      const pillClass = isActive ? styles.labelPillActive : styles.labelPill
                      const pillStyle =
                        isActive && label.color
                          ? { backgroundColor: `${label.color}18`, color: label.color, borderColor: `${label.color}40` }
                          : undefined
                      return (
                        <button
                          key={label.id}
                          type="button"
                          onClick={() => onToggleLabel(label.id)}
                          className={pillClass}
                          style={pillStyle}
                        >
                          #{label.name}
                        </button>
                      )
                    })}
                  </div>
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
          )}
        </div>
      )}
    </div>
  )
}
