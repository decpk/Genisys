import { useEffect } from 'react'

import { useSettingsStore } from '@/store/settings-store'

import { resolveTerminalFontFamily } from '../../../utils/resolveTerminalFontFamily'
import type { XtermBundle } from './useXtermInstance'

/**
 * Keep xterm's font in sync with the global "Code & Terminal → Terminal font family" setting.
 * Re-fits the terminal so cell math stays correct after a font swap.
 */
export function useTerminalFont(bundleRef: React.RefObject<XtermBundle | null>): void {
  const terminalFontFamily = useSettingsStore((s) => s.terminalFontFamily)

  useEffect(() => {
    const bundle = bundleRef.current
    if (!bundle) return
    const family = resolveTerminalFontFamily(terminalFontFamily)
    if (bundle.term.options.fontFamily === family) return
    bundle.term.options.fontFamily = family
    try {
      bundle.fit.fit()
    } catch {
      /* container may not be measurable yet */
    }
  }, [bundleRef, terminalFontFamily])
}
