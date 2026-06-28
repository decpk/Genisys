import { useEffect } from 'react'

import { useTerminalAppStore } from '@/store/terminal-app-store'
import { collectTabs } from '@/store/terminal-app-store/treeUtils'

import { isTerminalRestoreEnabled } from '../utils/terminalAppPersistence'
import { isTerminalRestoreComplete } from '../utils/terminalAppRestoreState'
import {
  flushAllSessions,
  reconcileCapture,
} from '../utils/terminalSessionCapture'

/**
 * Capture each standalone-Terminal tab's scrollback to disk so it can be
 * replayed into a fresh shell on the next launch. Drives the capture engine
 * (`terminalSessionCapture`): reconciles per-session output subscriptions on
 * every tree change and flushes the latest snapshots when the window is hidden
 * or about to close. Gated until restore settles (so a half-rebuilt surface
 * can't clobber a good file) and skipped entirely when session restore is off.
 */
export function useTerminalSessionCapture(): void {
  const tree = useTerminalAppStore((s) => s.tree)

  useEffect(() => {
    if (!isTerminalRestoreComplete() || !isTerminalRestoreEnabled()) return
    reconcileCapture(collectTabs(tree))
  }, [tree])

  // Best-effort flush when the window is hidden or about to close, so a quit
  // between debounced saves doesn't drop the most recent output.
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') flushAllSessions()
    }
    window.addEventListener('beforeunload', flushAllSessions)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.removeEventListener('beforeunload', flushAllSessions)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])
}
