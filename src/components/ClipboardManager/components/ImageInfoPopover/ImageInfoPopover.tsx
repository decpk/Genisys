import { useState } from 'react'
import { Info, Pencil, Check, X, Sparkles, AlertCircle } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { AppInlineLoader } from '@/components/AppLoader'
import { Tooltip } from '@/components/Tooltip'
import { useImageInfoPopoverData } from './useImageInfoPopoverData'
import { imageInfoPopoverStyles as styles } from './ImageInfoPopover.styles'
import { getAnalysisStatusColor } from './utils/getAnalysisStatusColor'
import type { ImageInfoPopoverProps } from './ImageInfoPopover.types'

export function ImageInfoPopover(props: ImageInfoPopoverProps): React.JSX.Element {
  const { item } = props

  const {
    isEditing,
    editValue,
    handleStartEdit,
    handleSave,
    handleCancel,
    handleRetry,
    handleEditValueChange,
  } = useImageInfoPopoverData(props)

  const [open, setOpen] = useState(false)

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen) handleCancel()
  }

  const statusColor = getAnalysisStatusColor(item.analysisStatus)
  const showEditTrigger = item.analysisStatus === 'done' && !isEditing
  const isPending = item.analysisStatus === 'pending'

  // For non-done states, show a status-driven action icon (loader / analyze / retry)
  // outside of the popover. Click triggers analysis directly.
  if (item.analysisStatus !== 'done') {
    if (isPending) {
      return (
        <Tooltip content="Analyzing image…" side="top">
          <span className={styles.triggerButton} aria-label="Analyzing image">
            <AppInlineLoader size={12} />
          </span>
        </Tooltip>
      )
    }

    const isFailed = item.analysisStatus === 'failed'
    const tooltipLabel = isFailed
      ? 'Analysis failed — click to retry'
      : 'Analyze image with AI'
    const Icon = isFailed ? AlertCircle : Sparkles
    const iconColor = isFailed ? 'text-amber-500' : 'text-muted-foreground/70 hover:text-foreground'

    return (
      <Tooltip content={tooltipLabel} side="top">
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleRetry()
          }}
          className={styles.triggerButton}
          aria-label={tooltipLabel}
        >
          <Icon size={12} className={iconColor} />
        </button>
      </Tooltip>
    )
  }

  // At this point analysisStatus is 'done'.
  const descriptionContent = (() => {
    if (isEditing) return null
    if (item.imageDescription) {
      return <p className={styles.descriptionText}>{item.imageDescription}</p>
    }
    return <p className={styles.statusText}>No description available</p>
  })()

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          onClick={(e) => e.stopPropagation()}
          className={styles.triggerButton}
        >
          <Info size={12} className={statusColor} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className={styles.popoverContent}
        side="bottom"
        align="start"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <span className={styles.label}>AI Description</span>
          <div className={styles.headerActions}>
            {showEditTrigger && (
              <button onClick={handleStartEdit} className={styles.editTriggerButton}>
                <Pencil size={11} className={styles.editTriggerIcon} />
              </button>
            )}
            {isEditing && (
              <div className={styles.editActions}>
                <button onClick={handleCancel} className={styles.cancelButton}>
                  <X size={13} className={styles.cancelIcon} />
                </button>
                <button onClick={handleSave} className={styles.saveButton}>
                  <Check size={13} className={styles.saveIcon} />
                </button>
              </div>
            )}
          </div>
        </div>

        {isEditing && (
          <textarea
            value={editValue}
            onChange={(e) => handleEditValueChange(e.target.value)}
            className={styles.textarea}
            autoFocus
          />
        )}

        {descriptionContent}
      </PopoverContent>
    </Popover>
  )
}
