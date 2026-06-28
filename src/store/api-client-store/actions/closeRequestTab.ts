import type { StoreApi } from 'zustand'
import type { ApiClientStore } from '../../api-client-store'
import type { ApiResponse } from '@/components/APIClient/APIClient.types'
import { getActiveTabMirror } from '../utils/getActiveTabMirror'
import { persistTabs } from '../utils/persistTabs'
import { loadRequestBodyIfNeeded } from '../utils/loadRequestBodyIfNeeded'

/**
 * Closes a request tab. Removes it from the open-tab list, drops its per-request
 * response/sending state, and — when the closed tab was active — activates the
 * nearest remaining neighbour (or clears the active tab when none remain).
 */
export function closeRequestTabAction(
  get: () => ApiClientStore,
  set: StoreApi<ApiClientStore>['setState'],
  id: string,
): void {
  const { openRequestTabs, activeRequestTabId, responsesByRequestId, sendingByRequestId } = get()
  const idx = openRequestTabs.indexOf(id)
  const nextTabs = openRequestTabs.filter((t) => t !== id)

  const nextResponses: Record<string, ApiResponse | null> = { ...responsesByRequestId }
  delete nextResponses[id]
  const nextSending: Record<string, boolean> = { ...sendingByRequestId }
  delete nextSending[id]

  let nextActive = activeRequestTabId
  if (activeRequestTabId === id) {
    nextActive = idx >= 0 ? (nextTabs[Math.min(idx, nextTabs.length - 1)] ?? null) : null
  }

  set({
    openRequestTabs: nextTabs,
    responsesByRequestId: nextResponses,
    sendingByRequestId: nextSending,
    activeRequestTabId: nextActive,
    ...getActiveTabMirror(
      { responsesByRequestId: nextResponses, sendingByRequestId: nextSending },
      nextActive,
    ),
  })

  persistTabs(get().activeWorkspaceId, nextTabs, nextActive)
  if (nextActive && nextActive !== activeRequestTabId) {
    loadRequestBodyIfNeeded(get, set, nextActive)
  }
}
