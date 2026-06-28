import { memo, useCallback } from 'react'
import { Minus, Plus, RotateCcw } from 'lucide-react'

import { IconButton } from '@/components/ui/icon-button'

import type { TypographyStepperProps } from './TypographyStepper.types'
import { roundToDecimals } from './utils/roundToDecimals'

export const TypographyStepper = memo(function TypographyStepper(props: TypographyStepperProps): React.JSX.Element {
  const {
    value,
    onChange,
    min,
    max,
    step,
    defaultValue,
    format,
    decimals = 0,
    decreaseTooltip = 'Decrease',
    increaseTooltip = 'Increase',
    resetTooltip,
  } = props

  const inc = useCallback(() => {
    onChange(roundToDecimals(Math.min(value + step, max), decimals))
  }, [value, step, max, decimals, onChange])

  const dec = useCallback(() => {
    onChange(roundToDecimals(Math.max(value - step, min), decimals))
  }, [value, step, min, decimals, onChange])

  const reset = useCallback(() => {
    onChange(defaultValue)
  }, [defaultValue, onChange])

  const showReset = value !== defaultValue
  const resetTip = resetTooltip ?? `Reset to ${format(defaultValue)}`

  return (
    <div className="flex items-center gap-2">
      <IconButton
        tooltip={decreaseTooltip}
        tooltipSide="bottom"
        className="border border-border"
        onClick={dec}
        disabled={value <= min}
      >
        <Minus size={14} />
      </IconButton>
      <span className="text-sm text-foreground min-w-[5ch] text-center tabular-nums">
        {format(value)}
      </span>
      <IconButton
        tooltip={increaseTooltip}
        tooltipSide="bottom"
        className="border border-border"
        onClick={inc}
        disabled={value >= max}
      >
        <Plus size={14} />
      </IconButton>
      {showReset && (
        <IconButton
          tooltip={resetTip}
          tooltipSide="bottom"
          className="border border-border ml-1"
          onClick={reset}
        >
          <RotateCcw size={14} />
        </IconButton>
      )}
    </div>
  )
})
