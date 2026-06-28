import { useEffect } from 'react'

import { useTerminalAppStore } from '@/store/terminal-app-store'
import { collectTabs } from '@/store/terminal-app-store/treeUtils'

import { gcSurfaces } from '../components/TerminalAppSurface/terminalAppSurfacePool'

/**
 * Disposes pooled xterm surfaces whose sessions have left the tree (tab closed
 * / pane closed). Splits and tab-switches keep ids alive, so those operations
 * never trigger disposal — only genuine removals do.
 */
export function useTerminalAppSurfaceGc(): void {
  const tree = useTerminalAppStore((s) => s.tree)
  useEffect(() => {
    const live = new Set(collectTabs(tree).map((t) => t.id))
    gcSurfaces(live)
  }, [tree])
}
