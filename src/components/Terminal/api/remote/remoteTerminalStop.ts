/** Stop sharing the terminal and disconnect all remote clients. */
export async function remoteTerminalStop(): Promise<void> {
  const res = await window.api.remoteTerminalStop()
  if (!res?.success) {
    throw new Error(res?.error || 'Failed to stop remote terminal sharing')
  }
}
