import { useEffect } from 'react'

/**
 * Calls `onEscape` when the user presses Escape, while `enabled` is
 * `true`. Listener is attached at the window level with `capture: false`
 * so it only fires when no inner stop-propagation handler intercepts.
 *
 * When it handles Escape it consumes the event (`preventDefault` +
 * `stopPropagation`) so the keypress can't fall through to the WebView /
 * native window defaults (e.g. exiting macOS fullscreen) or other
 * global Escape handlers — the overlay is dismissed and nothing else.
 *
 * Use for lightweight overlays/drawers that want Esc-to-close without
 * the weight of a `Dialog` modal.
 */
export function useEscapeKey(onEscape: () => void, enabled: boolean): void {
  useEffect(() => {
    if (!enabled) return
    const handler = (e: KeyboardEvent): void => {
      if (e.key !== 'Escape') return
      e.preventDefault()
      e.stopPropagation()
      onEscape()
    }
    window.addEventListener('keydown', handler)
    return () => {
      window.removeEventListener('keydown', handler)
    }
  }, [onEscape, enabled])
}
