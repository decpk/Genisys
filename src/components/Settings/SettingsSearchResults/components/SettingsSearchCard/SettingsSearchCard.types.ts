import type { SettingsSection } from '../../../Settings.types'
import type { SettingsSearchCardResult } from '../../../settings-search'

export interface SettingsSearchCardProps {
  card: SettingsSearchCardResult
  onNavigate: (section: SettingsSection) => void
}
