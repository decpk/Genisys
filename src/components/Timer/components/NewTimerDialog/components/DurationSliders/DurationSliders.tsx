import { Slider } from '@/components/ui/slider'

import type { DurationSlidersProps } from './DurationSliders.types'

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
      <Slider min={minMin} max={maxMin} step={stepMin} value={[valueMin]} onValueChange={handle} />
    </div>
  )
}

export function DurationSliders(props: DurationSlidersProps): React.JSX.Element {
  const {
    workSec,
    shortBreakSec,
    longBreakSec,
    onWorkChange,
    onShortBreakChange,
    onLongBreakChange,
  } = props
  return (
    <div className="flex flex-col gap-3">
      <SliderRow label="Work" valueSec={workSec} minMin={1} maxMin={120} stepMin={1} onChange={onWorkChange} />
      <SliderRow label="Short Break" valueSec={shortBreakSec} minMin={1} maxMin={30} stepMin={1} onChange={onShortBreakChange} />
      <SliderRow label="Long Break" valueSec={longBreakSec} minMin={1} maxMin={60} stepMin={1} onChange={onLongBreakChange} />
    </div>
  )
}
