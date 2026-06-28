import type { StoreApi } from 'zustand'
import type { ApiClientStore } from '../../api-client-store'
import { getActiveTabMirror } from '../utils/getActiveTabMirror'
import { persistTabs } from '../utils/persistTabs'
import { loadRequestBodyIfNeeded } from '../utils/loadRequestBodyIfNeeded'

/**
 * Activates an already-open request tab: updates the active tab id, refreshes
 * the legacy mirror fields from that tab's per-request state, persists the
 * selection, and lazily loads the request body when needed.
 */
export function setActiveRequestTabAction(
  get: () => ApiClientStore,
  set: StoreApi<ApiClientStore>['setState'],
  id: string | null,
): void {
  const state = get()
  set({
    activeRequestTabId: id,
    ...getActiveTabMirror(state, id),
  })
  persistTabs(state.activeWorkspaceId, state.openRequestTabs, id)
  if (id) loadRequestBodyIfNeeded(get, set, id)
}
