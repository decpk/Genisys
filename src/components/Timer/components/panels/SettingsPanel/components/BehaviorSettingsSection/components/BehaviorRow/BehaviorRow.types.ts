import type { BehaviorRowConfig } from '../../BehaviorSettingsSection.types'

export interface BehaviorRowProps {
  config: BehaviorRowConfig
  value: boolean
  onChange: (next: boolean) => void
}
