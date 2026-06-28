import type { StoreApi } from 'zustand'
import type { ApiClientStore } from '../../api-client-store'
import { persistTabs } from '../utils/persistTabs'

/**
 * Reorders the open request tabs (e.g. after a drag-and-drop) and persists the
 * new order. The provided ids must be the same set as the current open tabs.
 */
export function reorderRequestTabsAction(
  get: () => ApiClientStore,
  set: StoreApi<ApiClientStore>['setState'],
  ids: string[],
): void {
  set({ openRequestTabs: ids })
  const { activeWorkspaceId, activeRequestTabId } = get()
  persistTabs(activeWorkspaceId, ids, activeRequestTabId)
}
