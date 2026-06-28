import type { SettingsSection } from '../Settings.types'
import type { SettingsSearchResult } from '../settings-search'

export interface SettingsSearchResultsProps {
  result: SettingsSearchResult;
  onNavigate: (section: SettingsSection) => void;
}
