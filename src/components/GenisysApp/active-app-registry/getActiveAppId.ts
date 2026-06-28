import type { AppView } from '@/components/ActivityBar'

import { activeAppState } from './activeAppState'

/** Non-hook getter for the currently-active app id. */
export function getActiveAppId(): AppView {
  return activeAppState.current
}
