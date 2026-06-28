import type { SettingsSection } from '../Settings.types'

export function getNavButtonClass(key: SettingsSection, activeSection: SettingsSection): string {
  const isActive = activeSection === key
  if (isActive) {
    return 'bg-secondary text-foreground'
  }
  return 'text-muted-foreground hover:bg-secondary hover:text-foreground'
}
