import { useEffect } from 'react'

import { useTerminalAppStore } from '@/store/terminal-app-store'
import { collectTabs } from '@/store/terminal-app-store/treeUtils'

import { runTerminalRestore } from '../utils/terminalAppPersistence'
import {
  hasTerminalRestoreStarted,
  markTerminalRestoreComplete,
  markTerminalRestoreStarted,
} from '../utils/terminalAppRestoreState'

/**
 * On first mount, rebuilds the saved split-tree (re-spawning each shell in its
 * last working directory). When restore is disabled or there is nothing to
 * restore, it ensures a single fresh tab. Marks `started` synchronously so the
 * persistence hook stays gated until restore settles. Runs once per process.
 */
export function useTerminalAppRestore(): void {
  useEffect(() => {
    if (hasTerminalRestoreStarted()) return
    markTerminalRestoreStarted()
    void (async () => {
      try {
        const restored = await runTerminalRestore()
        if (!restored && collectTabs(useTerminalAppStore.getState().tree).length === 0) {
          await useTerminalAppStore.getState().createTab()
        }
      } finally {
        markTerminalRestoreComplete()
      }
    })()
  }, [])
}
