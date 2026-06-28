import { useCallback } from 'react'

import { useSettingsStore } from '@/store/settings-store'

/**
 * Returns a stable `handleReorder` callback that persists the new full tile
 * order to `useSettingsStore.tileOrder`.
 */
export function useDashboardReorder(): (orderedIds: string[]) => void {
  const setTileOrder = useSettingsStore((s) => s.setTileOrder)

  return useCallback(
    (orderedIds: string[]) => {
      setTileOrder(orderedIds)
    },
    [setTileOrder]
  )
}
