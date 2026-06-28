import { useMemo, useCallback } from 'react'
import { useMockServerStore } from '@/store/mock-server-store'
import type { MockServer } from '@/components/MockServer/MockServer.types'

export function useMockServerSidebarProjects() {
  const projects = useMockServerStore((s) => s.projects)
  const servers = useMockServerStore((s) => s.servers)
  const selectedServerId = useMockServerStore((s) => s.selectedServerId)
  const runningServers = useMockServerStore((s) => s.runningServers)
  const stopAllServers = useMockServerStore((s) => s.stopAllServers)
  const stopServer = useMockServerStore((s) => s.stopServer)
  const setSelectedServerId = useMockServerStore((s) => s.setSelectedServerId)

  const serversByProject = useMemo(() => {
    const map: Record<string, MockServer[]> = {}
    for (const server of servers) {
      if (!server) continue
      const list = map[server.project_id] ?? []
      list.push(server)
      map[server.project_id] = list
    }
    return map
  }, [servers])

  const runningServerIds = useMemo(() => {
    return new Set(runningServers.map((rs) => rs.server_id))
  }, [runningServers])

  const handleStopAll = useCallback(() => {
    stopAllServers()
  }, [stopAllServers])

  const handleStopServer = useCallback(
    (serverId: string) => {
      stopServer(serverId)
    },
    [stopServer]
  )

  const handleSelectServer = useCallback(
    (serverId: string) => {
      setSelectedServerId(serverId)
    },
    [setSelectedServerId]
  )

  return {
    projects,
    servers,
    serversByProject,
    selectedServerId,
    runningServers,
    runningServerIds,
    handleStopAll,
    handleStopServer,
    handleSelectServer,
  }
}
