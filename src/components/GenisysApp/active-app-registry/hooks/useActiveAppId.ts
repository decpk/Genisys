import { useSyncExternalStore } from 'react'

import type { AppView } from '@/components/ActivityBar'

import { getActiveAppId } from '../getActiveAppId'
import { subscribeActiveApp } from '../subscribeActiveApp'

/** Reactively read the currently-active (visible) app id. */
export function useActiveAppId(): AppView {
  return useSyncExternalStore(subscribeActiveApp, getActiveAppId, getActiveAppId)
}
