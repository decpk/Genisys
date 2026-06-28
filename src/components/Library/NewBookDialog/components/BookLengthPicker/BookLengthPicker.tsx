import { cn } from '@/lib/utils'

import { GRID_BASE, LABEL } from './BookLengthPicker.styles'
import type { BookLengthPickerProps } from './BookLengthPicker.types'
import { BookLengthOptionButton } from './components/BookLengthOptionButton'
import { selectLengthGridCols } from './utils/selectLengthGridCols'
import { selectLengthLabel } from './utils/selectLengthLabel'
import { selectLengthOptions } from './utils/selectLengthOptions'

export function BookLengthPicker(props: BookLengthPickerProps): React.JSX.Element {
  const { value, onChange, contentType, sourceType } = props
  const options = selectLengthOptions(contentType, sourceType)
  const label = selectLengthLabel(contentType, sourceType)
  const gridCols = selectLengthGridCols(options.length)

  return (
    <div>
      <label className={LABEL}>{label}</label>
      <div className={cn(GRID_BASE, gridCols)}>
        {options.map((option) => (
          <BookLengthOptionButton
            key={option.value}
            value={option.value}
            label={option.label}
            description={option.description}
            isSelected={value === option.value}
            onSelect={onChange}
          />
        ))}
      </div>
    </div>
  )
}
