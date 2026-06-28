import type { AppView } from '@/components/ActivityBar'

export interface UseAppModeReturn {
  activeApp: AppView
  setActiveApp: (app: AppView) => void
  activated: Record<AppView, boolean>
  /** Unmount an app and switch away if it was active. Dashboard cannot be deactivated. */
  deactivateApp: (app: AppView) => void
}
