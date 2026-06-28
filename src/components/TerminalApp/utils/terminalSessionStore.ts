// Disk-backed persistence for a standalone Terminal tab's scrollback.
//
// The Terminal app already restores tab/split layout + cwd on relaunch by
// re-spawning a fresh shell per tab. These helpers additionally save each tab's
// on-screen output (an ANSI snapshot from xterm's SerializeAddon) under
// `<app_data>/terminal-sessions/<persistentId>.ans` and replay it into the
// fresh shell, so a restored tab shows its previous history instead of a blank
// screen. Everything is keyed by the tab's stable `persistentId` — NOT the PTY
// session id, which is re-allocated on every app launch.

/** Best-effort write of a tab's scrollback snapshot. Never throws. */
export async function saveTerminalSession(
  persistentId: string,
  data: string,
): Promise<void> {
  try {
    await window.api?.terminalSessionSave(persistentId, data)
  } catch (err) {
    console.warn('[TerminalApp] save session scrollback failed', err)
  }
}

/** Read a tab's saved scrollback snapshot, or `null` when none / on error. */
export async function loadTerminalSession(
  persistentId: string,
): Promise<string | null> {
  try {
    const res = await window.api?.terminalSessionLoad(persistentId)
    return res?.success ? (res.data ?? null) : null
  } catch (err) {
    console.warn('[TerminalApp] load session scrollback failed', err)
    return null
  }
}

/** Best-effort delete of a tab's saved scrollback (on close). Never throws. */
export async function deleteTerminalSession(persistentId: string): Promise<void> {
  try {
    await window.api?.terminalSessionDelete(persistentId)
  } catch (err) {
    console.warn('[TerminalApp] delete session scrollback failed', err)
  }
}

/** Best-effort GC of saved scrollback files whose key is not in `keepKeys`. */
export async function pruneTerminalSessions(keepKeys: string[]): Promise<void> {
  try {
    await window.api?.terminalSessionPrune(keepKeys)
  } catch (err) {
    console.warn('[TerminalApp] prune session scrollback failed', err)
  }
}

// ── Pending replay (restore → surface) ─────────────────────────────────────
// On restore, a restored tab's saved scrollback is loaded and stashed here
// keyed by the NEW PTY session id. The surface pool drains it the instant the
// tab's xterm surface is created, writing the old scrollback above the fresh
// shell's prompt. Module-scoped (non-React) so it bridges the restore→render
// gap and is consumed exactly once per session.
const pendingReplay = new Map<string, string>()

/** Stash replay scrollback for a freshly-spawned session id. */
export function setPendingReplay(sessionId: string, data: string): void {
  pendingReplay.set(sessionId, data)
}

/** Take (and clear) any replay scrollback staged for a session id. */
export function takePendingReplay(sessionId: string): string | null {
  const data = pendingReplay.get(sessionId)
  if (data === undefined) return null
  pendingReplay.delete(sessionId)
  return data
}

/**
 * Load a restored tab's saved scrollback (by its stable `persistentId`) and, if
 * present, stage it for replay into the freshly-spawned session's surface
 * (`sessionId` = the new PTY id). Called from session restore right after the
 * shell is spawned and before the tab is added to the tree.
 */
export async function stageSessionReplay(
  persistentId: string,
  sessionId: string,
): Promise<void> {
  const data = await loadTerminalSession(persistentId)
  if (data) setPendingReplay(sessionId, data)
}
