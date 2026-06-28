import type { BookMode } from '../../NewBookDialog.types'

export interface ModeToggleProps {
  mode: BookMode
  onModeChange: (mode: BookMode) => void
}
