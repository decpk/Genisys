import { MAIN_WINDOW_LABEL } from '../window-actions.constants'

/**
 * Returns `true` only when the current Tauri window is the primary
 * application window (label === {@link MAIN_WINDOW_LABEL}).
 *
 * Returns `false` for every secondary / detached window
 * (`app-*`, `debug`, `timemachine`, `prtimemachine`, `timer-focus`)
 * and for non-Tauri contexts (browser dev mode, SSR, tests without a
 * Tauri runtime), so callers can use it as a safe gate without their
 * own try/catch.
 */
export async function isMainWindow(): Promise<boolean> {
  try {
    const { getCurrentWindow } = await import('@tauri-apps/api/window')
    return getCurrentWindow().label === MAIN_WINDOW_LABEL
  } catch {
    return false
  }
}
