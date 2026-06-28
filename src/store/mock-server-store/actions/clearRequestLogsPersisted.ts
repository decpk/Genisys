import type {
  MockServerStoreState,
  MockServerStoreActions,
} from '@/components/MockServer/MockServer.types'

/** Clears persisted request logs for a single server from SQLite, then prunes
 *  that server's entries from the in-memory `requestLogs` array. Logs for other
 *  servers are preserved. */
export async function clearRequestLogsPersistedAction(
  set: (partial: Partial<MockServerStoreState>) => void,
  get: () => MockServerStoreState & MockServerStoreActions,
  serverId: string
): Promise<void> {
  try {
    const result = await (window as any).api.mockClearLogs(serverId)
    if (!result?.success) return
    set({
      requestLogs: get().requestLogs.filter((l) => l.server_id !== serverId),
    })
  } catch {
    // silently ignore
  }
}
