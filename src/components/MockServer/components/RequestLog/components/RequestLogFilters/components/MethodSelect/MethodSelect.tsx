import { Select as SelectPrimitive } from 'radix-ui'
import { ChevronDown, Check } from 'lucide-react'

import type { HttpMethodOption, MethodSelectProps } from './MethodSelect.types'
import { HTTP_METHODS } from './MethodSelect.types'
import { methodSelectStyles } from './MethodSelect.styles'

export function MethodSelect(props: MethodSelectProps) {
  const { value, onValueChange, disabled } = props

  const handleChange = (next: string) => {
    onValueChange(next as HttpMethodOption)
  }

  return (
    <SelectPrimitive.Root value={value} onValueChange={handleChange} disabled={disabled}>
      <SelectPrimitive.Trigger
        aria-label="Filter by HTTP method"
        className={methodSelectStyles.trigger}
      >
        <SelectPrimitive.Value />
        <SelectPrimitive.Icon>
          <ChevronDown className={methodSelectStyles.icon} />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={4}
          className={methodSelectStyles.content}
        >
          <SelectPrimitive.Viewport className={methodSelectStyles.viewport}>
            {HTTP_METHODS.map((method) => (
              <SelectPrimitive.Item
                key={method}
                value={method}
                className={methodSelectStyles.item}
              >
                <SelectPrimitive.ItemText>
                  {method === 'ALL' ? 'All methods' : method}
                </SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator className="ml-auto pl-2">
                  <Check className="h-3 w-3" />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  )
}
