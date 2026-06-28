import { MinutesStepper } from '@/components/ui/minutes-stepper'
import { Slider } from '@/components/ui/slider'

import { minutesToSeconds } from '../../utils/minutesToSeconds'
import { secondsToMinutes } from '../../utils/secondsToMinutes'

import type { DurationRowProps } from './DurationRow.types'

export function DurationRow(props: DurationRowProps): React.JSX.Element {
  const { label, valueSec, minSec, maxSec, stepSec, onChange } = props

  const valueMin = secondsToMinutes(valueSec)
  const minMin = Math.max(1, secondsToMinutes(minSec))
  const maxMin = Math.max(minMin, secondsToMinutes(maxSec))

  const handleStepperChange = (nextMin: number) => {
    onChange(minutesToSeconds(nextMin))
  }

  const handleSliderChange = (vals: number[]) => {
    const next = vals[0]
    if (typeof next !== 'number') return
    onChange(next)
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[12px] font-medium text-foreground/90">{label}</span>
        <MinutesStepper
          value={valueMin}
          onChange={handleStepperChange}
          min={minMin}
          max={maxMin}
          step={1}
          suffix="min"
          ariaLabel={`${label} duration in minutes`}
        />
      </div>
      <Slider
        min={minSec}
        max={maxSec}
        step={stepSec}
        value={[valueSec]}
        onValueChange={handleSliderChange}
        aria-label={`${label} duration slider`}
      />
    </div>
  )
}
