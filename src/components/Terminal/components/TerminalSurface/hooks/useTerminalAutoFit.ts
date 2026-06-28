import { useEffect } from 'react'

import { terminalResize } from '../../../api/terminalResize'
import type { XtermBundle } from './useXtermInstance'

/** Observes container size and keeps both xterm fit + PTY size in sync. */
export function useTerminalAutoFit(
  container: React.RefObject<HTMLDivElement | null>,
  bundleRef: React.RefObject<XtermBundle | null>,
  sessionId: string,
  visible: boolean
): void {
  useEffect(() => {
    if (!container.current) return
    const target = container.current
    let lastCols = -1
    let lastRows = -1

    function applyFit() {
      const bundle = bundleRef.current
      if (!bundle) return
      try {
        bundle.fit.fit()
      } catch {
        return
      }
      const cols = bundle.term.cols
      const rows = bundle.term.rows
      if (cols === lastCols && rows === lastRows) return
      if (cols < 1 || rows < 1) return
      lastCols = cols
      lastRows = rows
      terminalResize(sessionId, cols, rows).catch((err) => {
        console.warn('[Terminal] resize failed', err)
      })
    }

    const observer = new ResizeObserver(() => applyFit())
    observer.observe(target)
    // initial pass after layout settles
    const raf = requestAnimationFrame(applyFit)

    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
    }
  }, [container, bundleRef, sessionId, visible])
}
