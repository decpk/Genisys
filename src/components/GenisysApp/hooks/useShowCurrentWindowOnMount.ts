import { useEffect } from 'react'

/**
 * Reveals the current Tauri webview window (and focuses it) once the React
 * tree has mounted. Used by standalone (detached) windows that are spawned
 * with `visible: false` so the user never sees a white flash while Vite/React
 * boot inside the new window.
 *
 * Safe to call in non-Tauri environments — failures are swallowed so the
 * standalone view still renders in a plain browser dev session.
 */
export function useShowCurrentWindowOnMount(): void {
  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const { getCurrentWindow } = await import('@tauri-apps/api/window')
        if (cancelled) return
        const win = getCurrentWindow()
        await win.show()
        await win.setFocus()
      } catch {
        // Not running under Tauri (e.g. plain browser dev) — nothing to do.
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])
}
