import { quitAppCommand } from '@/keyboard-shortcut-impl/window-actions/api/quitAppCommand'
import { useQuitConfirmStore } from '@/store/quit-confirm-store'

export async function performQuit(): Promise<void> {
  // Mark the bypass flag first so any `onCloseRequested` listener that fires
  // during the exit sequence (e.g. on Linux/Windows where `close()` is the
  // exit path) lets the close through instead of re-opening the modal.
  useQuitConfirmStore.getState().markConfirmedQuit()
  useQuitConfirmStore.getState().closeQuitConfirm()
  // Flush each standalone-Terminal tab's scrollback to disk BEFORE the process
  // exits, so a command run moments before quitting is replayed on the next
  // launch instead of showing a bare "session restored" marker. The unload-event
  // backstop can't finish its async writes once Rust calls `app_handle.exit(0)`,
  // so we must await the saves here. Dynamically imported to keep xterm out of
  // the quit path's static graph; a no-op when the Terminal app was never used.
  try {
    const { flushAllSessionsAsync } = await import(
      '@/components/TerminalApp/utils/terminalSessionCapture'
    )
    await flushAllSessionsAsync()
  } catch {
    // ignore — proceed with quitting regardless
  }
  try {
    // Rust-side `app_handle.exit(0)` — fully terminates the process on every
    // platform (including macOS, where `getCurrentWindow().close()` only
    // hides the window and keeps the dock icon alive).
    await quitAppCommand()
  } catch {
    // Non-Tauri (browser dev mode) — fall back to closing the browser window.
    // Most browsers block this for non-script-opened windows; nothing else
    // we can do without Tauri.
    window.close()
  }
}
