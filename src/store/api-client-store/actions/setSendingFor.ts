import type { StoreApi } from 'zustand'
import type { ApiClientStore } from '../../api-client-store'

/**
 * Sets the in-flight (sending) state for a specific request id. When that
 * request is the active tab, the legacy `isSending` mirror is updated too.
 * Keyed by id so several tabs can be sending simultaneously.
 */
export function setSendingForAction(
  set: StoreApi<ApiClientStore>['setState'],
  id: string,
  sending: boolean,
): void {
  set((s) => {
    const sendingByRequestId = { ...s.sendingByRequestId, [id]: sending }
    if (s.activeRequestTabId === id) {
      return { sendingByRequestId, isSending: sending }
    }
    return { sendingByRequestId }
  })
}
