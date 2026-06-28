import type { AppView } from '@/components/ActivityBar'

export interface GenisysMainContentProps {
  activeApp: AppView
  activated: Record<AppView, boolean>
  /**
   * Switches the workspace to the full Settings app. Wired through to
   * the in-app `SettingsSidePanel`'s "Open full Settings" affordance.
   */
  onOpenSettingsApp: () => void
}
