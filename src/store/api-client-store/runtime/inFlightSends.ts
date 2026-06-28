/**
 * Module-level registry of in-flight API Client sends, keyed by request (tab) id.
 *
 * Tracks the per-send cancellation id so a send can be cancelled from anywhere
 * (the Send→Stop button or the response-area Cancel button) and so the
 * originating send can tell whether it was cancelled and skip writing its late
 * response. Kept OUT of the zustand store because it is transient runtime state
 * (mutated in place, never rendered) — storing it in the store would risk
 * snapshot churn.
 */
interface InFlightSend {
  sendId: string
  cancelled: boolean
}

const inFlight = new Map<string, InFlightSend>()

/** Record that a send (identified by `sendId`) is in flight for `requestId`. */
export function registerSend(requestId: string, sendId: string): void {
  inFlight.set(requestId, { sendId, cancelled: false })
}

/** Get the in-flight send entry for `requestId`, if any. */
export function getInFlightSend(requestId: string): InFlightSend | undefined {
  return inFlight.get(requestId)
}

/**
 * Mark the in-flight send for `requestId` as cancelled and return it, or
 * `undefined` when nothing is in flight (nothing to cancel).
 */
export function markSendCancelled(requestId: string): InFlightSend | undefined {
  const entry = inFlight.get(requestId)
  if (entry) entry.cancelled = true
  return entry
}

/**
 * Remove the in-flight entry for `requestId`, but only when it still refers to
 * THIS `sendId`, so a newer send that superseded it is not clobbered.
 */
export function unregisterSend(requestId: string, sendId: string): void {
  const entry = inFlight.get(requestId)
  if (entry && entry.sendId === sendId) inFlight.delete(requestId)
}
