import { inspectorStyles } from '../../inspector.styles'

import type { InspectorNumberProps } from './InspectorNumber.types'

export function InspectorNumber(props: InspectorNumberProps): React.JSX.Element {
  const { label, value, onChange, step = 1, min, max } = props

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const next = Number(e.target.value)
    if (!Number.isNaN(next)) onChange(next)
  }

  return (
    <label className={inspectorStyles.label}>
      <span>{label}</span>
      <input
        type="number"
        value={value}
        step={step}
        min={min}
        max={max}
        onChange={handleChange}
        className={inspectorStyles.numberInput}
      />
    </label>
  )
}
