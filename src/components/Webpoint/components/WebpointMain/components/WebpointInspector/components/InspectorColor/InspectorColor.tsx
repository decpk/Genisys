import { Popover as PopoverPrimitive } from 'radix-ui'

import { ColorPicker } from '@/components/ColorPicker'
import { cn } from '@/lib/utils'

import { inspectorStyles } from '../../inspector.styles'

import type { InspectorColorProps } from './InspectorColor.types'

export function InspectorColor(props: InspectorColorProps): React.JSX.Element {
  const { label, value, onChange } = props

  return (
    <div className={inspectorStyles.label}>
      <span>{label}</span>
      <PopoverPrimitive.Root>
        <PopoverPrimitive.Trigger asChild>
          <button
            type="button"
            aria-label={label}
            className={inspectorStyles.swatch}
            style={{ background: value }}
          />
        </PopoverPrimitive.Trigger>
        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            sideOffset={6}
            align="end"
            className="z-50 rounded-lg border border-border/60 bg-popover p-3 shadow-lg"
          >
            <ColorPicker hex={value} onChange={onChange} />
            <input
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className={cn(inspectorStyles.input, 'mt-2')}
            />
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    </div>
  )
}
