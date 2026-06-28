import type { NewBookDialogData } from '../../hooks/useNewBookDialogData'

export interface NewBookDialogLocalModeProps {
  data: NewBookDialogData
  onCancel: () => void
}
