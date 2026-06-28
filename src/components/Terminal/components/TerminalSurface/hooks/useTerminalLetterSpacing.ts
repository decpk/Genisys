import { useEffect } from 'react'

import { useSettingsStore } from '@/store/settings-store'

import type { XtermBundle } from './useXtermInstance'

/** Keep xterm letter spacing in sync with the global Terminal letter-spacing setting. */
export function useTerminalLetterSpacing(bundleRef: React.RefObject<XtermBundle | null>): void {
  const letterSpacing = useSettingsStore((s) => s.terminalLetterSpacing)

  useEffect(() => {
    const bundle = bundleRef.current
    if (!bundle) return
    if (bundle.term.options.letterSpacing === letterSpacing) return
    bundle.term.options.letterSpacing = letterSpacing
    try {
      bundle.fit.fit()
    } catch {
      /* container may not be measurable yet */
    }
  }, [bundleRef, letterSpacing])
}
