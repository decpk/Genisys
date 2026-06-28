import { DURATION_ROWS } from './DefaultDurationsSection.constants'
import type { DefaultDurationsSectionProps } from './DefaultDurationsSection.types'
import { DurationRow } from './components/DurationRow'
import { SessionsBetweenLongBreakRow } from './components/SessionsBetweenLongBreakRow'

export function DefaultDurationsSection(
  props: DefaultDurationsSectionProps,
): React.JSX.Element {
  const { settings, onChange } = props

  const rows = DURATION_ROWS.map((row) => (
    <DurationRow
      key={row.key}
      label={row.label}
      valueSec={settings[row.key]}
      minSec={row.minSec}
      maxSec={row.maxSec}
      stepSec={row.stepSec}
      onChange={(nextSec) => onChange({ [row.key]: nextSec })}
    />
  ))

  const handleSessionsChange = (next: number) => {
    onChange({ sessionsBetweenLongBreak: next })
  }

  return (
    <div className="flex flex-col gap-3">
      {rows}
      <SessionsBetweenLongBreakRow
        value={settings.sessionsBetweenLongBreak}
        onChange={handleSessionsChange}
      />
    </div>
  )
}
