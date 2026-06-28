import type { StoreApi } from 'zustand'
import type { ApiClientStore } from '../../api-client-store'
import type { ApiResponse } from '@/components/APIClient/APIClient.types'

/**
 * Stores a response for a specific request id. When that request is the active
 * tab, the legacy `activeResponse` mirror is updated too so existing consumers
 * keep working. Keyed by id so concurrent sends in other tabs are unaffected.
 */
export function setResponseForAction(
  set: StoreApi<ApiClientStore>['setState'],
  id: string,
  response: ApiResponse | null,
): void {
  set((s) => {
    const responsesByRequestId = { ...s.responsesByRequestId, [id]: response }
    if (s.activeRequestTabId === id) {
      return { responsesByRequestId, activeResponse: response }
    }
    return { responsesByRequestId }
  })
}
