import { useCallback, useMemo } from 'react'

import { useMockServerStore } from '@/store/mock-server-store'
import type { MockEndpoint } from '@/components/MockServer/MockServer.types'

export function useEndpointTabBarData() {
  const selectedServerId = useMockServerStore((s) => s.selectedServerId)
  const endpoints = useMockServerStore((s) => s.endpoints)
  const openEndpointTabs = useMockServerStore((s) => s.openEndpointTabs)
  const activeEndpointTabId = useMockServerStore((s) => s.activeEndpointTabId)
  const openEndpointTab = useMockServerStore((s) => s.openEndpointTab)
  const closeEndpointTab = useMockServerStore((s) => s.closeEndpointTab)
  const requestCloseEndpointTab = useMockServerStore((s) => s.requestCloseEndpointTab)
  const confirmCloseEndpointTab = useMockServerStore((s) => s.confirmCloseEndpointTab)
  const cancelCloseEndpointTab = useMockServerStore((s) => s.cancelCloseEndpointTab)
  const pendingCloseTabId = useMockServerStore((s) => s.pendingCloseTabId)
  const setActiveEndpointTab = useMockServerStore((s) => s.setActiveEndpointTab)
  const deleteEndpoint = useMockServerStore((s) => s.deleteEndpoint)
  const duplicateEndpoint = useMockServerStore((s) => s.duplicateEndpoint)

  const serverEndpoints = useMemo((): MockEndpoint[] => {
    if (!selectedServerId) return []
    return endpoints[selectedServerId] ?? []
  }, [selectedServerId, endpoints])

  // Map tab IDs to endpoint objects (preserving tab order)
  const tabEndpoints = useMemo((): MockEndpoint[] => {
    return openEndpointTabs
      .map((id) => serverEndpoints.find((ep) => ep.id === id))
      .filter(Boolean) as MockEndpoint[]
  }, [openEndpointTabs, serverEndpoints])

  // Endpoints not currently open as tabs (for overflow menu)
  const hiddenEndpoints = useMemo((): MockEndpoint[] => {
    const openSet = new Set(openEndpointTabs)
    return serverEndpoints.filter((ep) => !openSet.has(ep.id))
  }, [serverEndpoints, openEndpointTabs])

  const handleActivate = useCallback(
    (id: string) => setActiveEndpointTab(id),
    [setActiveEndpointTab]
  )

  const handleClose = useCallback(
    (id: string) => requestCloseEndpointTab(id),
    [requestCloseEndpointTab]
  )

  const handleCloseOthers = useCallback(
    (id: string) => {
      for (const tabId of openEndpointTabs) {
        if (tabId !== id) closeEndpointTab(tabId)
      }
      setActiveEndpointTab(id)
    },
    [openEndpointTabs, closeEndpointTab, setActiveEndpointTab]
  )

  const handleCloseAll = useCallback(() => {
    for (const tabId of openEndpointTabs) {
      closeEndpointTab(tabId)
    }
  }, [openEndpointTabs, closeEndpointTab])

  const handleReopen = useCallback(
    (id: string) => openEndpointTab(id),
    [openEndpointTab]
  )

  const handleDelete = useCallback(
    (id: string) => deleteEndpoint(id),
    [deleteEndpoint]
  )

  const handleDuplicate = useCallback(
    (id: string) => duplicateEndpoint(id),
    [duplicateEndpoint]
  )

  // Endpoint object pending close confirmation (for the dialog message)
  const pendingCloseEndpoint = useMemo((): MockEndpoint | null => {
    if (!pendingCloseTabId) return null
    return serverEndpoints.find((ep) => ep.id === pendingCloseTabId) ?? null
  }, [pendingCloseTabId, serverEndpoints])

  return {
    tabEndpoints,
    hiddenEndpoints,
    activeEndpointTabId,
    pendingCloseTabId,
    pendingCloseEndpoint,
    confirmCloseEndpointTab,
    cancelCloseEndpointTab,
    handleActivate,
    handleClose,
    handleCloseOthers,
    handleCloseAll,
    handleReopen,
    handleDelete,
    handleDuplicate,
  }
}
