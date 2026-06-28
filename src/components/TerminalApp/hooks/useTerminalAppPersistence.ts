import { useEffect } from 'react'

import { useTerminalAppStore } from '@/store/terminal-app-store'

import { scheduleTerminalSnapshotSave } from '../utils/terminalAppPersistence'
import { isTerminalRestoreComplete } from '../utils/terminalAppRestoreState'

/**
 * Persists the split-tree (structure + live cwd, debounced) whenever it changes
 * — but never while restore is still in flight, so a half-rebuilt tree can't
 * clobber the saved snapshot.
 */
export function useTerminalAppPersistence(): void {
  const tree = useTerminalAppStore((s) => s.tree)
  const activeGroupId = useTerminalAppStore((s) => s.activeGroupId)

  useEffect(() => {
    if (!isTerminalRestoreComplete()) return
    scheduleTerminalSnapshotSave()
  }, [tree, activeGroupId])
}
