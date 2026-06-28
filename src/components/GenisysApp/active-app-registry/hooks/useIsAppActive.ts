import type { AppView } from '@/components/ActivityBar'

import { useActiveAppId } from './useActiveAppId'

/**
 * Whether the given app is the currently-active (visible) app. Use to gate
 * background work (tickers, pollers, refreshes) so hidden apps go quiet.
 */
export function useIsAppActive(appId: AppView): boolean {
  return useActiveAppId() === appId
}
