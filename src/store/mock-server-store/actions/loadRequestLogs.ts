import type {
  MockServerStoreState,
  MockServerStoreActions,
  RequestLogEntry,
} from '@/components/MockServer/MockServer.types'

/** Loads persisted request logs for a single server from SQLite (with optional
 *  filters) and reconciles them into the flat `requestLogs` array used by the
 *  live event listener. The DB returns newest-first (ORDER BY timestamp DESC);
 *  the live-append convention is newest-last, so we reverse before merging.
 *  Existing logs for the same server are replaced; logs for other servers are
 *  preserved. */
export async function loadRequestLogsAction(
  set: (partial: Partial<MockServerStoreState>) => void,
  get: () => MockServerStoreState & MockServerStoreActions,
  params: {
    serverId: string
    method?: string
    status?: number
    pathContains?: string
    limit?: number
  }
): Promise<void> {
  try {
    const result = await (window as any).api.mockLoadLogs(params)
    if (!result?.success) return
    const loaded = ((result.data ?? []) as RequestLogEntry[]).slice().reverse()
    const others = get().requestLogs.filter(
      (l) => l.server_id !== params.serverId
    )
    set({ requestLogs: [...others, ...loaded] })
  } catch {
    // silently ignore — UI can retry
  }
}
