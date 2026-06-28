import type { RemotePermissions } from './types'

/**
 * Push the host's remote-device permissions (allow new tab / allow close tab) to
 * the remote-terminal server. Every connected browser instantly shows or hides
 * its new-tab (+) and close (x) controls, and the server begins enforcing the
 * change for any action a device attempts.
 */
export async function remoteTerminalSetPermissions(
  permissions: RemotePermissions,
): Promise<void> {
  const res = await window.api.remoteTerminalSetPermissions(permissions)
  if (!res?.success) {
    throw new Error(res?.error || 'Failed to update remote terminal permissions')
  }
}
