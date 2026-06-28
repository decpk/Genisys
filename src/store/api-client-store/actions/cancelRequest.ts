import type { StoreApi } from 'zustand'
import type { ApiClientStore } from '../../api-client-store'
import { markSendCancelled } from '../runtime/inFlightSends'
import { setSendingForAction } from './setSendingFor'
import { setResponseForAction } from './setResponseFor'

/**
 * Cancels the in-flight send for `requestId`. Aborts the Rust-side request via
 * `apiCancelRequest` (which trips the cancellation token so the backend drops the
 * network future), marks the send cancelled so the originating `handleSend` skips
 * its late response, flips the sending flag off, and shows a "Cancelled" response
 * for instant feedback. No-op when nothing is in flight for that id.
 *
 * History is refreshed by `handleSend` once the cancelled command returns (the
 * backend records a `cancelled` entry), avoiding a race with this immediate call.
 */
export function cancelRequestAction(
  set: StoreApi<ApiClientStore>['setState'],
  requestId: string,
): void {
  const entry = markSendCancelled(requestId)
  if (!entry) return

  void window.api.apiCancelRequest(entry.sendId)

  setSendingForAction(set, requestId, false)
  setResponseForAction(set, requestId, {
    status: 0,
    statusText: 'Cancelled',
    headers: {},
    body: 'Request cancelled',
    time: 0,
    size: 0,
    cancelled: true,
  })
}
