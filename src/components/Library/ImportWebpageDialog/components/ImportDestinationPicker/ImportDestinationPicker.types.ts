import type { ImportDestination } from '../../ImportWebpageDialog.types'

export interface ImportDestinationPickerProps {
  value: ImportDestination
  onChange: (value: ImportDestination) => void
}
