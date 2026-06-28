import { cn } from '@/lib/utils'

import { inspectorStyles } from '../../inspector.styles'

import type { InspectorSelectProps } from './InspectorSelect.types'

export function InspectorSelect(props: InspectorSelectProps): React.JSX.Element {
  const { label, value, options, onChange } = props

  return (
    <label className={inspectorStyles.label}>
      <span>{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(inspectorStyles.input, 'w-28')}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}
