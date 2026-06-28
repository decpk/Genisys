import { FileText, FileUp, X } from 'lucide-react'

import { AppInlineLoader } from '@/components/AppLoader'

import { STYLES } from './FileSourceField.styles'
import type { FileSourceFieldProps } from './FileSourceField.types'
import { getFileName } from './utils/getFileName'

export function FileSourceField(props: FileSourceFieldProps) {
  const { filePath, isReadingFile, onPick, onClear } = props

  if (isReadingFile) {
    return (
      <div className={STYLES.pickButton}>
        <AppInlineLoader message="Reading file…" size={16} />
      </div>
    )
  }

  if (!filePath) {
    return (
      <button type="button" onClick={onPick} className={STYLES.pickButton}>
        <FileUp size={16} />
        Choose an .html or .htm file
      </button>
    )
  }

  const fileName = getFileName(filePath)

  return (
    <div className={STYLES.chip}>
      <span className={STYLES.chipLeft}>
        <FileText size={14} className="shrink-0 text-primary" />
        <span className={STYLES.chipName}>{fileName}</span>
      </span>
      <button
        type="button"
        onClick={onClear}
        className={STYLES.clearButton}
        aria-label="Remove selected file"
      >
        <X size={14} />
      </button>
    </div>
  )
}
