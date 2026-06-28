import { useEffect } from 'react'

import { useThemeStore } from '@/store/theme-store'

import { getXtermThemeColors } from '../../../utils/getXtermThemeColors'
import type { XtermBundle } from './useXtermInstance'

/**
 * Keep the xterm canvas colors in sync with the active app theme.
 *
 * Re-applies whenever `activeThemeId` changes — CSS custom properties have
 * already been written to `:root` by `applyTheme` at that point.
 */
export function useXtermTheme(bundleRef: React.RefObject<XtermBundle | null>): void {
  const activeThemeId = useThemeStore((s) => s.activeThemeId)

  useEffect(() => {
    const bundle = bundleRef.current
    if (!bundle) return
    bundle.term.options.theme = getXtermThemeColors()
  }, [bundleRef, activeThemeId])
}
