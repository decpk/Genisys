/**
 * Resolve a session's live working directory via the backend PID probe.
 * Returns `null` when unavailable (session gone, or unsupported platform).
 * Used by session restore to capture each tab's last cwd.
 */
export async function terminalCwd(id: string): Promise<string | null> {
  const res = await (window as { api: { terminalCwd: (id: string) => Promise<{ success: boolean; data?: { cwd: string | null } }> } }).api.terminalCwd(id)
  if (!res?.success) return null
  return res.data?.cwd ?? null
}
