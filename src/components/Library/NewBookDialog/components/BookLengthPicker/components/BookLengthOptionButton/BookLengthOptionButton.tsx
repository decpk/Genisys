import { cn } from '@/lib/utils'

import {
  BUTTON_BASE,
  BUTTON_SELECTED,
  BUTTON_UNSELECTED,
  OPTION_DESCRIPTION,
  OPTION_LABEL,
} from '../../BookLengthPicker.styles'

import type { BookLengthOptionButtonProps } from './BookLengthOptionButton.types'

export function BookLengthOptionButton(props: BookLengthOptionButtonProps): React.JSX.Element {
  const { value, label, description, isSelected, onSelect } = props
  const stateClass = isSelected ? BUTTON_SELECTED : BUTTON_UNSELECTED

  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={cn(BUTTON_BASE, stateClass)}
    >
      <span className={OPTION_LABEL}>{label}</span>
      <span className={OPTION_DESCRIPTION}>{description}</span>
    </button>
  )
}
