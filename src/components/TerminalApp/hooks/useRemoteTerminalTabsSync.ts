import { useEffect } from 'react'

import { remoteTerminalSetTabs } from '@/components/Terminal/api/remote/remoteTerminalSetTabs'
import { useTerminalAppStore } from '@/store/terminal-app-store'
import { collectTabs } from '@/store/terminal-app-store/treeUtils'

import { isTerminalRestoreComplete } from '../utils/terminalAppRestoreState'

const PUSH_DEBOUNCE_MS = 250

/**
 * Mirrors the standalone Terminal app's open tabs (ordered, with their titles)
 * to the remote-terminal server so LAN browser clients see exactly these tabs —
 * not the dock terminal's sessions or orphaned PTYs. Debounced, and skipped
 * while restore is still in flight so a half-rebuilt tree can't push a
 * misleading list. The backend intersects the pushed ids with live sessions, so
 * pushing while sharing is off (or before a client connects) is harmless.
 */
export function useRemoteTerminalTabsSync(): void {
  const tree = useTerminalAppStore((s) => s.tree)

  useEffect(() => {
    if (!isTerminalRestoreComplete()) return
    const handle = setTimeout(() => {
      const tabs = collectTabs(tree).map((t) => ({ id: t.id, title: t.title }))
      void remoteTerminalSetTabs(tabs).catch(() => {
        // Sharing may be off or the bridge not ready; the next tree change
        // re-pushes, and the backend retains the last list across (re)starts.
      })
    }, PUSH_DEBOUNCE_MS)
    return () => clearTimeout(handle)
  }, [tree])
}
