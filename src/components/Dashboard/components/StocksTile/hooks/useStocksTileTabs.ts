import { useCallback, useState } from 'react'

const ALL_TAB = '__all__'

interface UseStocksTileTabsResult {
  activeTab: string
  setActiveTab: (id: string) => void
  isAllTab: boolean
  /** Sentinel id of the "All" overview tab. */
  ALL_TAB: typeof ALL_TAB
}

/**
 * Manages which watch-item id is currently selected. Defaults to the
 * "All" overview tab.
 */
export function useStocksTileTabs(): UseStocksTileTabsResult {
  const [activeTab, setActiveTabState] = useState<string>(ALL_TAB)
  const setActiveTab = useCallback((id: string) => setActiveTabState(id), [])
  return {
    activeTab,
    setActiveTab,
    isAllTab: activeTab === ALL_TAB,
    ALL_TAB,
  }
}

export { ALL_TAB as STOCKS_ALL_TAB }
