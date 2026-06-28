import type { MoveMode } from '../../SectionActionsMenu.types'

export interface SectionMoveDialogProps {
  open: boolean
  mode: MoveMode | null
  itemCount: number
  itemNoun: string
  sectionTitle: string
  onConfirm: (targetDate: string) => void
  onCancel: () => void
}
