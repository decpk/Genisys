import { useEffect } from 'react'

import { useSettingsStore } from '@/store/settings-store'

import type { XtermBundle } from './useXtermInstance'

/** Keep xterm font size in sync with the global "Code & Terminal → Terminal font size" setting. */
export function useTerminalFontSize(bundleRef: React.RefObject<XtermBundle | null>): void {
  const fontSize = useSettingsStore((s) => s.terminalFontSize)

  useEffect(() => {
    const bundle = bundleRef.current
    if (!bundle) return
    if (bundle.term.options.fontSize === fontSize) return
    bundle.term.options.fontSize = fontSize
    try {
      bundle.fit.fit()
    } catch {
      /* container may not be measurable yet */
    }
  }, [bundleRef, fontSize])
}
