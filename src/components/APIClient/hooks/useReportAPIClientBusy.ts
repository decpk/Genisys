import { useReportAppBusy } from '@/components/GenisysApp/app-activity-registry'
import { useApiClientStore } from '@/store/api-client-store'

/**
 * Reports the APIClient app as busy while an HTTP request is in flight, so the
 * keep-alive eviction never unmounts it mid-request. Covers both the legacy
 * single-send flag (`isSending`) and per-tab concurrent sends
 * (`sendingByRequestId`). Both are read via reactive store selectors so the
 * busy flag updates live. Each selector returns a primitive boolean to avoid
 * fresh-reference re-render loops.
 */
export function useReportAPIClientBusy(): void {
  const isSending = useApiClientStore((s) => s.isSending)
  const anyTabSending = useApiClientStore((s) =>
    Object.values(s.sendingByRequestId).some(Boolean),
  )
  useReportAppBusy('apiclient', isSending || anyTabSending)
}
