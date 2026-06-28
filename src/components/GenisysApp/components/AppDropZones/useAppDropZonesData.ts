import { useMemo } from 'react'

import { APP_ITEMS, type AppItem } from '@/components/ActivityBar/ActivityBar.items'
import { useAppDragStore } from '@/store/app-drag-store'

/**
 * Reads the shared drag store and resolves the dragged app's display metadata
 * (icon + label) from `APP_ITEMS` for the drop overlay. Selects primitives
 * separately to avoid handing a fresh literal back from a Zustand selector.
 */
export function useAppDropZonesData(): {
  draggingApp: ReturnType<typeof useAppDragStore.getState>['draggingApp']
  pointerZone: ReturnType<typeof useAppDragStore.getState>['pointerZone']
  draggedItem: AppItem | null
} {
  const draggingApp = useAppDragStore((s) => s.draggingApp)
  const pointerZone = useAppDragStore((s) => s.pointerZone)

  const draggedItem = useMemo<AppItem | null>(
    () =>
      draggingApp
        ? APP_ITEMS.find((item) => item.mode === draggingApp) ?? null
        : null,
    [draggingApp],
  )

  return { draggingApp, pointerZone, draggedItem }
}
