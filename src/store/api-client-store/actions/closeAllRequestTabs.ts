import type { StoreApi } from 'zustand'
import type { ApiClientStore } from '../../api-client-store'
import { persistTabs } from '../utils/persistTabs'

/**
 * Closes all request tabs, clearing every per-request response/sending entry
 * and resetting the active tab + legacy mirror fields.
 */
export function closeAllRequestTabsAction(
  get: () => ApiClientStore,
  set: StoreApi<ApiClientStore>['setState'],
): void {
  set({
    openRequestTabs: [],
    activeRequestTabId: null,
    responsesByRequestId: {},
    sendingByRequestId: {},
    activeRequestId: null,
    activeResponse: null,
    isSending: false,
  })
  persistTabs(get().activeWorkspaceId, [], null)
}
