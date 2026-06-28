import { useCallback } from 'react'

import type { SidebarHeaderStripProps } from './SidebarHeaderStrip.types'

interface UseSidebarHeaderStripDataResult {
  handleAddClick: () => void
  handleClearAll: () => void
  handleFilterChange: (value: string) => void
}

export function useSidebarHeaderStripData(
  props: SidebarHeaderStripProps
): UseSidebarHeaderStripDataResult {
  const { onAddClick, onClearAll, onFilterChange } = props

  const handleAddClick = useCallback(() => {
    onAddClick()
  }, [onAddClick])

  const handleClearAll = useCallback(() => {
    onClearAll()
  }, [onClearAll])

  const handleFilterChange = useCallback(
    (value: string) => {
      onFilterChange(value)
    },
    [onFilterChange]
  )

  return { handleAddClick, handleClearAll, handleFilterChange }
}
