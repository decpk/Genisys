import { useEffect } from 'react'

import { activateDailyPlanSearch } from '../components/DailyPlanSearchPanel/utils/searchFocusRegistry'

interface UseDailyPlanSearchShortcutParams {
  setRightPanelOpen: (open: boolean) => void
  setActiveTab: (tabId: string) => void
}

export function useDailyPlanSearchShortcut(params: UseDailyPlanSearchShortcutParams): void {
  const { setRightPanelOpen, setActiveTab } = params

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key === 'f') {
        e.preventDefault()
        setRightPanelOpen(true)
        setActiveTab('search')
        requestAnimationFrame(() => {
          activateDailyPlanSearch()
        })
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [setRightPanelOpen, setActiveTab])
}
