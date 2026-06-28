import { memo } from 'react'

import { cn } from '@/lib/utils'

import type { TypographyWeightPickerProps } from './TypographyWeightPicker.types'
import { WEIGHT_OPTIONS } from './TypographyWeightPicker.constants'

export const TypographyWeightPicker = memo(function TypographyWeightPicker(
  props: TypographyWeightPickerProps
): React.JSX.Element {
  const { value, onChange } = props

  return (
    <div className="inline-flex items-center rounded-lg border border-border/40 bg-secondary/60 p-0.5">
      {WEIGHT_OPTIONS.map((opt) => {
        const isActive = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              'px-3 py-1 text-xs rounded-md transition-colors cursor-pointer',
              isActive
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
})
