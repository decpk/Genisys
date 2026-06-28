import { Save, X, RotateCcw } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { MarkdownEditorPreview } from '@/components/ui/markdown-editor-preview'
import { Tooltip } from '@/components/Tooltip'
import { useStatusTemplateModalData } from './useStatusTemplateModalData'
import { styles } from './StatusTemplateModal.styles'
import type { StatusTemplateModalProps } from './StatusTemplateModal.types'

export function StatusTemplateModal(props: StatusTemplateModalProps): React.JSX.Element {
  const { open, onOpenChange } = props
  const { data, actions } = useStatusTemplateModalData(open, onOpenChange)
  const { editingContent, isDirty } = data
  const { setEditingContent, handleSave, handleResetToDefault, handleRequestClose } = actions

  const headerContent = (
    <div className={styles.header}>
      <div className={styles.headerInner}>
        <div className={styles.headerLeft}>
          <span className={styles.headerTitle}>Edit Status Template</span>
          {isDirty && (
            <span className="w-2 h-2 rounded-full bg-warning shrink-0" title="Unsaved changes" />
          )}
        </div>
        <div className={styles.headerRight}>
          <Tooltip content="Reset to default template" side="bottom">
            <button onClick={handleResetToDefault} className={styles.resetButton}>
              <RotateCcw size={12} />
              <span>Reset</span>
            </button>
          </Tooltip>
          <Tooltip content="Close" side="bottom">
            <button onClick={handleRequestClose} className={styles.closeButton}>
              <X size={16} />
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  )

  const footerContent = (
    <div className={styles.footer}>
      <Tooltip content="Discard changes" side="top">
        <button onClick={handleRequestClose} className={styles.cancelButton}>
          Cancel
        </button>
      </Tooltip>
      <Tooltip content="Save template" side="top">
        <button onClick={handleSave} disabled={!isDirty} className={styles.saveButton}>
          <Save size={12} />
          <span>Save</span>
        </button>
      </Tooltip>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={handleRequestClose}>
      <DialogContent
        showCloseButton={false}
        className={styles.dialogContent}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogTitle className="sr-only">Edit Status Template</DialogTitle>

        <MarkdownEditorPreview
          content={editingContent}
          onChange={setEditingContent}
          header={headerContent}
          footer={footerContent}
          leftPaneLabel="Template"
          rightPaneLabel="Preview"
          className="flex-1"
        />
      </DialogContent>
    </Dialog>
  )
}
