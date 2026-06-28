import { FolderOpen, FileText, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { LocalFilesPickerProps } from './LocalFilesPicker.types'
import * as styles from './LocalFilesPicker.styles'
import { useLocalFilesPickerData } from './useLocalFilesPickerData'

export function LocalFilesPicker(props: LocalFilesPickerProps): React.JSX.Element {
  const { files, onBrowse, onRemove, onFilesDropped, enabled } = props
  const { dropzoneRef, isDragOver } = useLocalFilesPickerData({
    enabled,
    onFilesDropped,
  })
  const hasFiles = files.length > 0
  const isSingle = files.length === 1
  const countLabel = isSingle ? '1 file selected' : `${files.length} files selected`

  let listNode: React.JSX.Element | null = null
  if (hasFiles) {
    listNode = (
      <div className={styles.LIST_BOX}>
        {files.map((filePath) => (
          <div key={filePath} className={styles.FILE_ROW}>
            <FileText size={12} className="shrink-0 text-muted-foreground" />
            <span className={styles.FILE_NAME} title={filePath}>
              {filePath.split('/').pop()}
            </span>
            <button
              type="button"
              onClick={() => onRemove(filePath)}
              className={styles.REMOVE_BUTTON}
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>
    )
  }

  let emptyNode: React.JSX.Element | null = null
  if (!hasFiles) {
    const emptyMessage = isDragOver ? 'Drop markdown files here…' : 'No files selected'
    const emptyClass = cn(
      styles.EMPTY_PLACEHOLDER,
      isDragOver && styles.EMPTY_PLACEHOLDER_ACTIVE,
    )
    emptyNode = <div className={emptyClass}>{emptyMessage}</div>
  }

  const dropzoneClass = cn(styles.DROPZONE, isDragOver && styles.DROPZONE_ACTIVE)

  return (
    <>
      <label className={styles.LABEL}>Markdown Files</label>
      <div ref={dropzoneRef} className={dropzoneClass}>
        <div className={styles.BROWSE_ROW}>
          <Button variant="outline" size="sm" type="button" onClick={onBrowse}>
            <FolderOpen size={13} className="mr-1.5" />
            Browse Files
          </Button>
        </div>
        {listNode}
        {emptyNode}
      </div>
      <p className={styles.HINT}>
        {countLabel}. Files are combined and split by # headings into chapters. You can
        also drag files from Finder onto the area above.
      </p>
    </>
  )
}
