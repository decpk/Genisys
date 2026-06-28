import type { StoreApi } from 'zustand'
import type { ApiClientStore } from '../../api-client-store'
import { setActiveRequestTabAction } from './setActiveRequestTab'

/**
 * Opens a request in a tab. Adds the request to the open-tab list if it is not
 * already present (preserving order), then activates it.
 */
export function openRequestTabAction(
  get: () => ApiClientStore,
  set: StoreApi<ApiClientStore>['setState'],
  id: string,
): void {
  const { openRequestTabs } = get()
  if (!openRequestTabs.includes(id)) {
    set({ openRequestTabs: [...openRequestTabs, id] })
  }
  setActiveRequestTabAction(get, set, id)
}
