import { useEffect } from 'react'

import type { AppView } from '@/components/ActivityBar'

import { useAppSwitcherStore } from './app-switcher-store'

/**
 * `KeyboardEvent.key` name of the modifier whose release commits the HUD.
 * The default `Ctrl+]` / `Ctrl+[` bindings are held with the Control key on
 * every platform, so releasing Control finalises the choice — same UX as
 * macOS Cmd+Tab.
 */
const COMMIT_MODIFIER_KEY = 'Control'

/**
 * Mounts the document-level listeners that drive the App Switcher HUD
 * outside of the shortcut framework:
 *
 *   - `keyup` on the Control modifier ⇒ commit the highlighted app and
 *     close the HUD. (The shortcut framework opens the HUD on `Ctrl+]`
 *     / `Ctrl+[` keydown; releasing Control is what finalises the
 *     choice — same UX as macOS Cmd+Tab.)
 *   - `keydown` on `Escape` ⇒ close without switching.
 *   - `keydown` on `ArrowLeft` / `ArrowRight` ⇒ advance the highlight in
 *     either direction while the HUD is open. Honoured even when the
 *     ActivityBar isn't focused.
 *
 * All listeners are no-ops when the HUD is closed, so the perf cost is
 * essentially zero in the common case.
 */
export function useAppSwitcherHotkeys(onCommit: (app: AppView) => void): void {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent): void {
      const { open } = useAppSwitcherStore.getState()
      if (!open) return

      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        useAppSwitcherStore.getState().close()
        return
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault()
        event.stopPropagation()
        useAppSwitcherStore.getState().advance(1)
        return
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        event.stopPropagation()
        useAppSwitcherStore.getState().advance(-1)
        return
      }
    }

    function onKeyUp(event: KeyboardEvent): void {
      const { open } = useAppSwitcherStore.getState();
      if (!open) return;

      // Commit on release of Control — the modifier held during
      // Ctrl+Tab / Ctrl+Shift+Tab. Mirrors macOS Cmd+Tab where releasing
      // the modifier finalises the switch.
      if (event.key === COMMIT_MODIFIER_KEY) {
        event.preventDefault();
        event.stopPropagation();
        useAppSwitcherStore.getState().commit(onCommit);
      }
    }

    // `capture: true` so we beat any focused inputs / Monaco etc.
    document.addEventListener('keydown', onKeyDown, true)
    document.addEventListener('keyup', onKeyUp, true)
    return () => {
      document.removeEventListener('keydown', onKeyDown, true)
      document.removeEventListener('keyup', onKeyUp, true)
    }
  }, [onCommit])
}
