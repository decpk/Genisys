import { memo } from 'react'

import { cn } from '@/lib/utils'

import type { RangeSelectorProps } from './RangeSelector.types'

export const RangeSelector = memo(function RangeSelector(
  props: RangeSelectorProps,
): React.JSX.Element {
  const { value, options, onChange } = props

  return (
    <div
      role="radiogroup"
      aria-label="Time range"
      className="inline-flex items-center gap-0.5 rounded-lg border border-border/60 bg-card p-0.5"
    >
      {options.map((option) => {
        const isActive = option.value === value
        const buttonClass = cn(
          'rounded-md px-3 py-1 text-xs font-medium transition-colors',
          isActive
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:bg-primary/10 hover:text-foreground',
        )
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            className={buttonClass}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
})
