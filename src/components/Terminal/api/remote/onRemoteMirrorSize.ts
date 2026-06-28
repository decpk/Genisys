/**
 * Subscribe to remote "mirror size" control changes: a remote mirror client
 * started (or stopped) driving a shared desktop tab's size. While `controlled`,
 * `cols`x`rows` is the phone's requested viewport; the desktop clamps the shared
 * PTY (and its own xterm grid) to min(that, the desktop's container capacity) so
 * neither end is clipped. On release (`controlled: false`) the desktop re-fits to
 * its container and reclaims its own dimensions. Returns an unsubscribe fn.
 */
export function onRemoteMirrorSize(
  callback: (payload: {
    sessionId: string
    cols: number
    rows: number
    controlled: boolean
  }) => void,
): () => void {
  return window.api.onRemoteMirrorSize(callback)
}
