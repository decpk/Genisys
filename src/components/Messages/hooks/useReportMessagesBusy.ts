import { useReportAppBusy } from '@/components/GenisysApp/app-activity-registry'
import { useMessagesStore } from '@/store/messages-store'

/**
 * Reports the Messages app as busy while a call is active or incoming, so the
 * keep-alive eviction never unmounts it mid-call. Reads the call state via
 * reactive store selectors so the busy flag updates live as calls start/end.
 */
export function useReportMessagesBusy(): void {
  const busy = useMessagesStore((s) => s.call !== null || s.incomingCall !== null)
  useReportAppBusy('messages', busy)
}
