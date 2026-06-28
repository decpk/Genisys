import { Pencil, RotateCcw, X, Check } from 'lucide-react'
import { AppInlineLoader } from '@/components/AppLoader'
import { DescriptionContent } from './components/DescriptionContent'
import { useImageDescriptionPaneData } from './hooks/useImageDescriptionPaneData'
import { imageDescriptionPaneStyles as styles } from './ImageDescriptionPane.styles'
import type { ImageDescriptionPaneProps } from './ImageDescriptionPane.types'

export function ImageDescriptionPane(props: ImageDescriptionPaneProps): React.JSX.Element {
  const { imageDescription, analysisStatus } = props

  const {
    isEditing,
    editValue,
    handleStartEdit,
    handleSave,
    handleCancel,
    handleRetry,
    handleEditValueChange,
  } = useImageDescriptionPaneData(props)

  const isPending = analysisStatus === 'pending'
  const showEditButton = analysisStatus === 'done' && !isEditing
  const showRetryButton = analysisStatus === 'failed'

  let bodyContent: React.JSX.Element
  if (isEditing) {
    bodyContent = (
      <textarea
        value={editValue}
        onChange={(e) => handleEditValueChange(e.target.value)}
        className={styles.textarea}
        autoFocus
      />
    )
  } else {
    bodyContent = (
      <DescriptionContent
        analysisStatus={analysisStatus}
        imageDescription={imageDescription}
      />
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.label}>AI Description</span>
          {isPending && <AppInlineLoader size={12} message="Analyzing..." />}
          {showRetryButton && (
            <button onClick={handleRetry} className={styles.retryButton}>
              <RotateCcw size={11} />
              Retry
            </button>
          )}
        </div>
        {showEditButton && (
          <button onClick={handleStartEdit} className={styles.editButton}>
            <Pencil size={11} />
            Edit
          </button>
        )}
        {isEditing && (
          <div className={styles.editActions}>
            <button onClick={handleCancel} className={styles.cancelButton}>
              <X size={14} className={styles.cancelIcon} />
            </button>
            <button onClick={handleSave} className={styles.saveButton}>
              <Check size={14} className={styles.saveIcon} />
            </button>
          </div>
        )}
      </div>
      <div className={styles.body}>{bodyContent}</div>
    </div>
  )
}
