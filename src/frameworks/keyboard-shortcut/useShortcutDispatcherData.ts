import { useEffect } from 'react'

import { getEffectiveActiveApp } from './scopeOverride'
import { getActionMap } from './utils/bindActions'
import { getChordPrefix } from './utils/chord-state/getChordPrefix'
import { dispatchShortcutEvent } from './utils/dispatchShortcutEvent'
import { isInputFocused } from './utils/isInputFocused'
import { isPureModifierEvent } from './utils/isPureModifierEvent'
import { parseKeyChord } from './utils/parseKeyChord'
import { hasPlainInputShortcuts, resolveShortcuts } from './utils/resolveShortcuts'
import { selectActiveShortcuts } from './utils/selectActiveShortcuts'

/**
 * Mounts the global keydown listener that drives the keyboard shortcut
 * framework. Single source of truth for dispatching matched shortcut
 * actions. Safe to mount multiple times — uses a module-level action
 * map and chord state.
 */
export function useShortcutDispatcherData(): void {
  useEffect(() => {
    function handler(event: KeyboardEvent): void {
      // Bare modifier presses (Shift/Ctrl/Alt/Meta alone) can't trigger a
      // shortcut and don't advance a chord — skip all work.
      if (isPureModifierEvent(event)) return

      // Fast path for ordinary typing: when an input is focused and the key
      // carries no Mod/Ctrl/Alt, the only shortcuts that could match are
      // `allowInInput` ones with no such modifier. When there are none (the
      // common case) and no chord is pending, do nothing — this keeps every
      // keystroke in every input free of shortcut-resolution work.
      if (
        isInputFocused() &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey &&
        !getChordPrefix() &&
        !hasPlainInputShortcuts()
      ) {
        return
      }

      const activeApp = getEffectiveActiveApp()
      const resolved = resolveShortcuts()
      const actionMap = getActionMap()
      const candidates = selectActiveShortcuts(resolved, activeApp)

      const result = dispatchShortcutEvent(event, candidates, (id) => {
        const action = actionMap.get(id)
        if (!action) return false
        action()
        return true
      })

      if (result.handled) {
        event.preventDefault()
        event.stopPropagation()
      }
    }

    document.addEventListener('keydown', handler)

    // Pre-warm the dispatch path once during idle so the first keystroke
    // after launch doesn't pay cold cache-build + JIT costs while the main
    // thread is still busy with startup work. requestIdleCallback isn't
    // available in every webview (e.g. some WKWebView builds), so fall back
    // to a macrotask.
    const warmUp = (): void => {
      const resolved = resolveShortcuts()
      for (const shortcut of resolved) parseKeyChord(shortcut.keys)
    }
    let idleId: number | undefined
    let timeoutId: ReturnType<typeof setTimeout> | undefined
    if (typeof window.requestIdleCallback === 'function') {
      idleId = window.requestIdleCallback(warmUp)
    } else {
      timeoutId = setTimeout(warmUp, 0)
    }

    return () => {
      document.removeEventListener('keydown', handler)
      if (idleId !== undefined && typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(idleId)
      }
      if (timeoutId !== undefined) clearTimeout(timeoutId)
    }
  }, [])
}
