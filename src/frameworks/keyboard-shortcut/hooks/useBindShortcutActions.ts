import { useEffect } from 'react'

import type { ShortcutActionMap } from '../KeyboardShortcut.types'
import { bindActions } from '../utils/bindActions'

// ── Bind actions (Pattern A) ─────────────────────────────────────────

export function useBindShortcutActions(actions: ShortcutActionMap): void {
  useEffect(() => {
    return bindActions(actions)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
