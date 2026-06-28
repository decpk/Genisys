import type { ImportSource } from '../../ImportWebpageDialog.types'

export interface ImportSourcePickerProps {
  value: ImportSource
  onChange: (value: ImportSource) => void
}
