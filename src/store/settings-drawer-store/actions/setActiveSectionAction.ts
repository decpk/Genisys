import type { SettingsSection } from '@/components/Settings/Settings.types'

import type { SettingsDrawerState } from '../settings-drawer-store.types'

export function setActiveSectionAction(
  set: (partial: Partial<SettingsDrawerState>) => void,
  section: SettingsSection,
): void {
  set({ activeSection: section })
}
