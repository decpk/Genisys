import { useCallback, useMemo } from 'react'

import { useMockServerStore } from '@/store/mock-server-store'
import type { MockEndpoint } from '@/components/MockServer/MockServer.types'

export function useEndpointListData() {
  const selectedServerId = useMockServerStore((s) => s.selectedServerId)
  const endpoints = useMockServerStore((s) => s.endpoints)
  const createEndpoint = useMockServerStore((s) => s.createEndpoint)
  const deleteEndpoint = useMockServerStore((s) => s.deleteEndpoint)
  const duplicateEndpoint = useMockServerStore((s) => s.duplicateEndpoint)
  const updateEndpoint = useMockServerStore((s) => s.updateEndpoint)
  const setSelectedEndpointId = useMockServerStore((s) => s.setSelectedEndpointId)
  const selectedEndpointId = useMockServerStore((s) => s.selectedEndpointId)

  const serverEndpoints = useMemo((): MockEndpoint[] => {
    if (!selectedServerId) return []
    return endpoints[selectedServerId] ?? []
  }, [selectedServerId, endpoints])

  const handleCreateEndpoint = useCallback(async () => {
    if (!selectedServerId) return
    await createEndpoint({
      server_id: selectedServerId,
      method: 'GET',
      path: '/new-endpoint',
      status_code: 200,
      response_headers: '{"Content-Type":"application/json"}',
      response_body: '{}',
      response_type: 'static',
      ai_prompt: '',
      ai_schema: '',
      ai_count: 1,
      delay_ms: 0,
      description: '',
      is_active: true,
    })
  }, [selectedServerId, createEndpoint])

  const handleDeleteEndpoint = useCallback(
    async (id: string) => {
      await deleteEndpoint(id)
      if (selectedEndpointId === id) {
        setSelectedEndpointId(null)
      }
    },
    [deleteEndpoint, selectedEndpointId, setSelectedEndpointId]
  )

  const handleDuplicateEndpoint = useCallback(
    async (id: string) => {
      await duplicateEndpoint(id)
    },
    [duplicateEndpoint]
  )

  const handleToggleActive = useCallback(
    async (endpoint: MockEndpoint) => {
      await updateEndpoint({ ...endpoint, is_active: !endpoint.is_active })
    },
    [updateEndpoint]
  )

  const handleSelectEndpoint = useCallback(
    (id: string) => {
      setSelectedEndpointId(id)
    },
    [setSelectedEndpointId]
  )

  return {
    endpoints: serverEndpoints,
    selectedEndpointId,
    handleCreateEndpoint,
    handleDeleteEndpoint,
    handleDuplicateEndpoint,
    handleToggleActive,
    handleSelectEndpoint,
  }
}
