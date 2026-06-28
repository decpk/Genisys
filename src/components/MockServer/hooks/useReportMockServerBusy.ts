import { useReportAppBusy } from '@/components/GenisysApp/app-activity-registry'
import { useMockServerStore } from '@/store/mock-server-store'

/**
 * Reports the MockServer app as busy while at least one mock server is running,
 * so the keep-alive eviction never unmounts it while it is serving requests.
 * Reads `runningServers` via a reactive store selector so the busy flag updates
 * live as servers start/stop.
 */
export function useReportMockServerBusy(): void {
  const busy = useMockServerStore((s) => s.runningServers.length > 0)
  useReportAppBusy('mockserver', busy)
}
