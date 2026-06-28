import { cn } from '@/lib/utils'
import type { MoveModalUnsortedRowProps } from './MoveModalUnsortedRow.types'
import {
  moveModalUnsortedRowBaseClass,
  moveModalUnsortedRowStateClass,
} from './MoveModalUnsortedRow.styles'

export function MoveModalUnsortedRow(props: MoveModalUnsortedRowProps) {
  const { isSelected, onSelect } = props
  const stateClass = isSelected
    ? moveModalUnsortedRowStateClass.selected
    : moveModalUnsortedRowStateClass.idle
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(moveModalUnsortedRowBaseClass, stateClass)}
    >
      Unsorted (no notebook)
    </button>
  )
}
