import { useCallback, useMemo, useState } from 'react'
import {
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'

import { useApiClientStore } from '@/store/api-client-store'
import type { ApiRequestItem } from '../../APIClient.types'

export function useAPIClientTabBarData() {
  const requests = useApiClientStore((s) => s.requests)
  const openRequestTabs = useApiClientStore((s) => s.openRequestTabs)
  const activeRequestTabId = useApiClientStore((s) => s.activeRequestTabId)
  const sendingByRequestId = useApiClientStore((s) => s.sendingByRequestId)
  const pendingSaveRequestIds = useApiClientStore((s) => s.pendingSaveRequestIds)
  const openRequestTab = useApiClientStore((s) => s.openRequestTab)
  const setActiveRequestTab = useApiClientStore((s) => s.setActiveRequestTab)
  const closeRequestTab = useApiClientStore((s) => s.closeRequestTab)
  const closeOtherRequestTabs = useApiClientStore((s) => s.closeOtherRequestTabs)
  const closeAllRequestTabs = useApiClientStore((s) => s.closeAllRequestTabs)
  const reorderRequestTabs = useApiClientStore((s) => s.reorderRequestTabs)
  const addRequestToUncategorized = useApiClientStore((s) => s.addRequestToUncategorized)

  const tabRequests = useMemo<ApiRequestItem[]>(() => {
    return openRequestTabs
      .map((id) => requests.find((r) => r.id === id))
      .filter((r): r is ApiRequestItem => r !== undefined)
  }, [openRequestTabs, requests])

  const [draggingTabId, setDraggingTabId] = useState<string | null>(null)

  const draggingRequest = useMemo<ApiRequestItem | null>(() => {
    if (!draggingTabId) return null
    return requests.find((r) => r.id === draggingTabId) ?? null
  }, [draggingTabId, requests])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  )

  const handleActivate = useCallback(
    (id: string) => setActiveRequestTab(id),
    [setActiveRequestTab],
  )

  const handleJump = useCallback(
    (id: string) => setActiveRequestTab(id),
    [setActiveRequestTab],
  )

  const handleClose = useCallback(
    (id: string) => closeRequestTab(id),
    [closeRequestTab],
  )

  const handleCloseOthers = useCallback(
    (id: string) => closeOtherRequestTabs(id),
    [closeOtherRequestTabs],
  )

  const handleCloseAll = useCallback(
    () => closeAllRequestTabs(),
    [closeAllRequestTabs],
  )

  const handleReorder = useCallback(
    (ids: string[]) => reorderRequestTabs(ids),
    [reorderRequestTabs],
  )

  const handleNewTab = useCallback(async () => {
    const created = await addRequestToUncategorized()
    openRequestTab(created.id)
  }, [addRequestToUncategorized, openRequestTab])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      setDraggingTabId(null)
      if (!over || active.id === over.id) return
      const oldIndex = openRequestTabs.indexOf(String(active.id))
      const newIndex = openRequestTabs.indexOf(String(over.id))
      if (oldIndex === -1 || newIndex === -1) return
      handleReorder(arrayMove(openRequestTabs, oldIndex, newIndex))
    },
    [openRequestTabs, handleReorder],
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setDraggingTabId(String(event.active.id))
  }, [])

  const handleDragCancel = useCallback(() => {
    setDraggingTabId(null)
  }, [])

  return {
    openRequestTabs,
    tabRequests,
    activeRequestTabId,
    pendingSaveRequestIds,
    sendingByRequestId,
    sensors,
    draggingTabId,
    draggingRequest,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
    handleActivate,
    handleJump,
    handleClose,
    handleCloseOthers,
    handleCloseAll,
    handleReorder,
    handleNewTab,
  }
}
