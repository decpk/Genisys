export interface RemoteTab {
  id: string
  title: string
}

/**
 * Push the desktop Terminal app's current tab list (ordered, with titles) to the
 * remote-terminal server. LAN browser clients then mirror exactly these tabs —
 * scoping the remote view to the app's open tabs and giving each a readable label
 * instead of an indistinguishable "shell" row.
 */
export async function remoteTerminalSetTabs(tabs: RemoteTab[]): Promise<void> {
  const res = await window.api.remoteTerminalSetTabs(tabs)
  if (!res?.success) {
    throw new Error(res?.error || 'Failed to update remote terminal tabs')
  }
}
