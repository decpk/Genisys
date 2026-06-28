import type { SettingsSectionGroup, SettingsSectionItem } from '../Settings.types'

export interface SettingsNavGroupProps {
  group: SettingsSectionGroup
  activeSection: SettingsSectionItem['key']
  onSectionChange: (key: SettingsSectionItem['key']) => void
}
