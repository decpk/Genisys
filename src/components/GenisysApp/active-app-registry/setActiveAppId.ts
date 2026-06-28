import type { AppView } from '@/components/ActivityBar'

import { activeAppListeners, activeAppState } from './activeAppState'

/**
 * Update the globally-tracked active app and notify subscribers. No-ops when
 * unchanged. Called from `useAppMode` whenever the active app changes.
 */
export function setActiveAppId(appId: AppView): void {
  if (activeAppState.current === appId) return
  activeAppState.current = appId
  for (const listener of activeAppListeners) listener()
}
