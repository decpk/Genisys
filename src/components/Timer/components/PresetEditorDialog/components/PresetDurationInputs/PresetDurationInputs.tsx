import { Slider } from '@/components/ui/slider'

import type { PresetDurationInputsProps } from './PresetDurationInputs.types'

interface SliderRowProps {
  label: string
  valueSec: number
  minMin: number
  maxMin: number
  stepMin: number
  onChange: (sec: number) => void
}

function SliderRow(props: SliderRowProps): React.JSX.Element {
  const { label, valueSec, minMin, maxMin, stepMin, onChange } = props
  const valueMin = Math.round(valueSec / 60)
  const handle = (vals: number[]) => onChange((vals[0] ?? minMin) * 60)

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium tabular-nums">{valueMin} min</span>
      </div>
      <Slider
        min={minMin}
        max={maxMin}
        step={stepMin}
        value={[valueMin]}
        onValueChange={handle}
      />
    </div>
  )
}

/**
 * Duration controls for the preset editor.
 * - `pomodoro`: shows both work + break sliders.
 * - `countdown`: shows only the work slider.
 * - `stopwatch`: hides duration controls entirely.
 */
export function PresetDurationInputs(
  props: PresetDurationInputsProps,
): React.JSX.Element | null {
  const { mode, workSec, breakSec, onWorkChange, onBreakChange } = props

  if (mode === 'stopwatch') return null

  const showBreak = mode === 'pomodoro'
  const breakRow = showBreak ? (
    <SliderRow
      label="Break"
      valueSec={breakSec}
      minMin={1}
      maxMin={60}
      stepMin={1}
      onChange={onBreakChange}
    />
  ) : null

  return (
    <div className="flex flex-col gap-3">
      <SliderRow
        label="Work"
        valueSec={workSec}
        minMin={1}
        maxMin={120}
        stepMin={1}
        onChange={onWorkChange}
      />
      {breakRow}
    </div>
  )
}
