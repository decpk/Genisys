import { useReportAppBusy } from '@/components/GenisysApp/app-activity-registry'
import { useExplorerAIHistoryStore } from '@/store/explorer-ai-history-store'

/**
 * Reports ProjectExplorer as busy while any Explorer AI session is mid-task, so
 * the keep-alive LRU eviction never unmounts it and drops a running stream.
 *
 * Busy = at least one session whose `status` is `'thinking'`, `'executing'`, or
 * `'awaiting-confirmation'` (a confirmation gate that holds an in-flight
 * command). All sessions are scanned — not just the active one — so background
 * streams are covered.
 *
 * `status` is used rather than `activeStreamId` because the module-level stream
 * manager never resets `activeStreamId` back to `null` on completion, so it
 * would stay truthy forever and pin the app as permanently busy. The selector
 * returns a primitive boolean (via `.some(...)`), so it is safe against the
 * zustand "fresh literal" re-render trap.
 */
export function useReportExplorerBusy(): void {
  const busy = useExplorerAIHistoryStore((s) =>
    s.sessions.some(
      (session) =>
        session.status === 'thinking' ||
        session.status === 'executing' ||
        session.status === 'awaiting-confirmation',
    ),
  )
  useReportAppBusy('explorer', busy)
}
