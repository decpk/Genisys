import { useEffect } from 'react'

import { useSettingsStore } from '@/store/settings-store'

import { mapTerminalFontWeight } from '../../../utils/mapTerminalFontWeight'
import type { XtermBundle } from './useXtermInstance'

/** Keep xterm font weight in sync with the global Terminal font-weight setting. */
export function useTerminalFontWeight(bundleRef: React.RefObject<XtermBundle | null>): void {
  const weight = useSettingsStore((s) => s.terminalFontWeight)

  useEffect(() => {
    const bundle = bundleRef.current
    if (!bundle) return
    const mapped = mapTerminalFontWeight(weight)
    if (bundle.term.options.fontWeight === mapped) return
    bundle.term.options.fontWeight = mapped
    try {
      bundle.fit.fit()
    } catch {
      /* container may not be measurable yet */
    }
  }, [bundleRef, weight])
}
