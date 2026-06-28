import { ToggleGroup as ToggleGroupPrimitive } from 'radix-ui'

import { cn } from '@/lib/utils'

import { SOURCE_OPTIONS } from '../../ImportWebpageDialog.constants'
import type { ImportSource } from '../../ImportWebpageDialog.types'

import { STYLES } from './ImportSourcePicker.styles'
import type { ImportSourcePickerProps } from './ImportSourcePicker.types'

export function ImportSourcePicker(props: ImportSourcePickerProps) {
  const { value, onChange } = props

  const handleValueChange = (next: string) => {
    if (!next) return
    onChange(next as ImportSource)
  }

  return (
    <ToggleGroupPrimitive.Root
      type="single"
      value={value}
      onValueChange={handleValueChange}
      className={STYLES.root}
      aria-label="Import source"
    >
      {SOURCE_OPTIONS.map((option) => {
        const Icon = option.icon
        const isSelected = value === option.value
        const stateClass = isSelected ? STYLES.itemSelected : STYLES.itemUnselected
        const itemClass = cn(STYLES.item, stateClass)

        return (
          <ToggleGroupPrimitive.Item
            key={option.value}
            value={option.value}
            className={itemClass}
            aria-label={option.label}
          >
            <Icon size={16} />
            <span className={STYLES.label}>{option.label}</span>
            <span className={STYLES.description}>{option.description}</span>
          </ToggleGroupPrimitive.Item>
        )
      })}
    </ToggleGroupPrimitive.Root>
  )
}
