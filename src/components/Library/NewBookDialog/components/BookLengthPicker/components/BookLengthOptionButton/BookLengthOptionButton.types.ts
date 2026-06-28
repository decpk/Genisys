import type { BookLength } from '../../../../../book-prompt'

export interface BookLengthOptionButtonProps {
  value: BookLength
  label: string
  description: string
  isSelected: boolean
  onSelect: (value: BookLength) => void
}
