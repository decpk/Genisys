import type { StoreApi } from 'zustand'
import type { ApiClientStore } from '../../api-client-store'
import type { ApiResponse } from '@/components/APIClient/APIClient.types'
import { getActiveTabMirror } from '../utils/getActiveTabMirror'
import { persistTabs } from '../utils/persistTabs'

/**
 * Closes every request tab except the one with the given id, keeping only that
 * tab's per-request response/sending state and making it the active tab.
 */
export function closeOtherRequestTabsAction(
  get: () => ApiClientStore,
  set: StoreApi<ApiClientStore>['setState'],
  id: string,
): void {
  const { openRequestTabs, responsesByRequestId, sendingByRequestId } = get()
  if (!openRequestTabs.includes(id)) return

  const nextResponses: Record<string, ApiResponse | null> = {
    [id]: responsesByRequestId[id] ?? null,
  }
  const nextSending: Record<string, boolean> = {
    [id]: sendingByRequestId[id] ?? false,
  }

  set({
    openRequestTabs: [id],
    responsesByRequestId: nextResponses,
    sendingByRequestId: nextSending,
    activeRequestTabId: id,
    ...getActiveTabMirror(
      { responsesByRequestId: nextResponses, sendingByRequestId: nextSending },
      id,
    ),
  })

  persistTabs(get().activeWorkspaceId, [id], id)
}
