import { invoke } from '@tauri-apps/api/core'

/**
 * Asks the Rust side to fully exit the application process.
 *
 * `getCurrentWindow().close()` only closes the window — on macOS the app
 * process stays alive (dock icon remains). This invokes a Rust command that
 * calls `app_handle.exit(0)` so Cmd+Q truly quits Genisys.
 */
export function quitAppCommand(): Promise<void> {
  return invoke<void>('cmd_quit_app')
}
