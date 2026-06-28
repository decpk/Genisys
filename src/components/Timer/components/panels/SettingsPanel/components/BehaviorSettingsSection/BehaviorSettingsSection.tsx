import type { TimerSettings } from '@/store/timer-store/timer-store.types'

import { BEHAVIOR_ROWS } from './BehaviorSettingsSection.constants'
import type {
  BehaviorSettingKey,
  BehaviorSettingsSectionProps,
} from './BehaviorSettingsSection.types'
import { BehaviorRow } from './components/BehaviorRow'

export function BehaviorSettingsSection(
  props: BehaviorSettingsSectionProps,
): React.JSX.Element {
  const { settings, onChange } = props

  const handleRowChange = (key: BehaviorSettingKey) => (next: boolean) => {
    onChange({ [key]: next } as Partial<TimerSettings>)
  }

  return (
    <div className="flex flex-col">
      {BEHAVIOR_ROWS.map((row) => (
        <BehaviorRow
          key={row.key}
          config={row}
          value={settings[row.key]}
          onChange={handleRowChange(row.key)}
        />
      ))}
    </div>
  )
}
