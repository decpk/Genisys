import { useCallback, useMemo } from 'react'

import { useMockServerStore } from '@/store/mock-server-store'
import { useApiClientStore } from '@/store/api-client-store'
import { useNavigationStore } from '@/store/navigation-store'
import type { HttpMethod } from '@/components/APIClient/APIClient.types'
import type { MockEndpoint } from '@/components/MockServer/MockServer.types'

export function useTestInApiClientButtonData(endpoint: MockEndpoint | null) {
  const servers = useMockServerStore((s) => s.servers)
  const runningServers = useMockServerStore((s) => s.runningServers)
  const startServer = useMockServerStore((s) => s.startServer)
  const addRequestToUncategorized = useApiClientStore((s) => s.addRequestToUncategorized)
  const updateRequest = useApiClientStore((s) => s.updateRequest)
  const openApiClientRequest = useNavigationStore((s) => s.openApiClientRequest)

  const server = useMemo(
    () => (endpoint ? servers.find((srv) => srv.id === endpoint.server_id) ?? null : null),
    [servers, endpoint]
  )

  const isServerRunning = useMemo(
    () => (endpoint ? runningServers.some((r) => r.server_id === endpoint.server_id) : false),
    [runningServers, endpoint]
  )

  const canTest = endpoint !== null && server !== null

  const handleStartServer = useCallback(async (): Promise<boolean> => {
    if (!endpoint) return false
    const result = await startServer(endpoint.server_id)
    return Boolean(result?.success)
  }, [endpoint, startServer])

  const handleTest = useCallback(async () => {
    if (!endpoint || !server) return
    const url = `http://localhost:${server.port}${endpoint.path}`
    const request = await addRequestToUncategorized()
    await updateRequest(request.id, {
      name: `${endpoint.method} ${endpoint.path}`,
      method: endpoint.method as HttpMethod,
      url,
    })
    openApiClientRequest(request.id)
  }, [endpoint, server, addRequestToUncategorized, updateRequest, openApiClientRequest])

  return { canTest, isServerRunning, handleStartServer, handleTest }
}
