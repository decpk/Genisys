import { useCallback, useState } from 'react'

import type {
  ClipboardImageHoverTabValue,
  UseClipboardImageHoverTabsDataResult,
} from './ClipboardImageHoverTabs.types'

const DEFAULT_TAB: ClipboardImageHoverTabValue = 'description'

/**
 * Owns the active-tab state for the clipboard image hover popover.
 * Coerces the generic `string` value emitted by the shared `Tabs`
 * primitive back into the strict `ClipboardImageHoverTabValue` union
 * so consumers stay type-safe.
 */
export function useClipboardImageHoverTabsData(): UseClipboardImageHoverTabsDataResult {
  const [activeTab, setActiveTab] = useState<ClipboardImageHoverTabValue>(DEFAULT_TAB)

  const onTabChange = useCallback((value: string): void => {
    setActiveTab(value as ClipboardImageHoverTabValue)
  }, [])

  return { activeTab, onTabChange }
}
