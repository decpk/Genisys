import { useState, useCallback } from 'react'

import type { RightPanelTabsProps } from './RightPanelTabs.types'
import { getDefaultTab } from './utils/getDefaultTab'

export function useRightPanelTabsData({ panels, activeTab, onTabChange }: RightPanelTabsProps) {
  const [internalTab, setInternalTab] = useState(() => getDefaultTab(panels))

  const currentTab = activeTab ?? internalTab

  const handleTabChange = useCallback(
    (tabId: string) => {
      setInternalTab(tabId)
      onTabChange?.(tabId)
    },
    [onTabChange],
  )

  return { currentTab, handleTabChange }
}
