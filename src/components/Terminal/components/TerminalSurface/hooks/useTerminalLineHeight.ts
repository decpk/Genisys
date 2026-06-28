import { useEffect } from 'react'

import { useSettingsStore } from '@/store/settings-store'

import type { XtermBundle } from './useXtermInstance'

/** Keep xterm line height in sync with the global Terminal line-height setting. */
export function useTerminalLineHeight(bundleRef: React.RefObject<XtermBundle | null>): void {
  const lineHeight = useSettingsStore((s) => s.terminalLineHeight)

  useEffect(() => {
    const bundle = bundleRef.current
    if (!bundle) return
    if (bundle.term.options.lineHeight === lineHeight) return
    bundle.term.options.lineHeight = lineHeight
    try {
      bundle.fit.fit()
    } catch {
      /* container may not be measurable yet */
    }
  }, [bundleRef, lineHeight])
}
