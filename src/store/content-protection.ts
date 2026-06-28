// Screen-capture protection helpers.
//
// When enabled, Tauri marks a window's content as protected so it cannot be
// captured by screenshots, screen recordings, or screen-sharing. On macOS this
// sets `NSWindow.sharingType = .none`; on Windows it uses
// `SetWindowDisplayAffinity(WDA_EXCLUDEFROMCAPTURE)`. On Linux it is a no-op.
//
// All calls are wrapped in try/catch so a missing/unsupported platform (or a
// non-Tauri/web context) never throws into the settings flow.

/** Protect (or unprotect) the window that is running the current webview. */
export async function applyContentProtectionCurrent(
  enabled: boolean,
): Promise<void> {
  try {
    const { getCurrentWindow } = await import('@tauri-apps/api/window')
    await getCurrentWindow().setContentProtected(enabled)
  } catch (err) {
    // No-op on platforms / contexts where this is unavailable.
    if (import.meta.env.DEV) {
      console.warn('[content-protection] current window failed:', err)
    }
  }
}

/** Protect (or unprotect) every currently open application window. */
export async function applyContentProtectionAll(
  enabled: boolean,
): Promise<void> {
  try {
    const { getAllWindows } = await import('@tauri-apps/api/window')
    const windows = await getAllWindows()
    await Promise.all(
      windows.map((w) =>
        w.setContentProtected(enabled).catch((err) => {
          if (import.meta.env.DEV) {
            console.warn(
              `[content-protection] window "${w.label}" failed:`,
              err,
            )
          }
        }),
      ),
    )
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn('[content-protection] getAllWindows failed:', err)
    }
  }
}
