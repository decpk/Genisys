import type { ImportSource } from '../../ImportWebpageDialog.types'

export interface ImportSourceFieldsProps {
  source: ImportSource
  url: string
  onUrlChange: (value: string) => void
  html: string
  onHtmlChange: (value: string) => void
  filePath: string
  isReadingFile: boolean
  onPickFile: () => void
  onClearFile: () => void
  onSubmit: () => void
}
