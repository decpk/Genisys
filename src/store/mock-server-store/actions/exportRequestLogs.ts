/** Exports all persisted request logs for a single server as a JSON string
 *  (pretty-printable by the caller). Returns "[]" on failure so callers can
 *  always write a valid file. */
export async function exportRequestLogsAction(
  serverId: string
): Promise<string> {
  try {
    const result = await (window as any).api.mockExportLogs(serverId)
    if (result?.success && typeof result.data === 'string') {
      return result.data
    }
  } catch {
    // fall through to default
  }
  return '[]'
}
