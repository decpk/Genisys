import { useState, useEffect, useRef, useCallback, useMemo } from 'react'

import { useMockServerStore } from '@/store/mock-server-store'

export function useServerConfigPanelData() {
  const selectedServerId = useMockServerStore((s) => s.selectedServerId)
  const servers = useMockServerStore((s) => s.servers)
  const runningServers = useMockServerStore((s) => s.runningServers)
  const updateServer = useMockServerStore((s) => s.updateServer)
  const startServer = useMockServerStore((s) => s.startServer)
  const stopServer = useMockServerStore((s) => s.stopServer)
  const projects = useMockServerStore((s) => s.projects)

  const server = useMemo(
    () => servers.find((s) => s.id === selectedServerId) ?? null,
    [servers, selectedServerId]
  )

  const [name, setName] = useState('')
  const [port, setPort] = useState(3000)
  const [portAvailable, setPortAvailable] = useState<boolean | null>(null)
  const [isCheckingPort, setIsCheckingPort] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState('')

  const portCheckTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!server) return
    setName(server.name)
    setPort(server.port)
    setSelectedProjectId(server.project_id)
    setPortAvailable(null)
  }, [server])

  useEffect(() => {
    if (!server) return
    if (port === server.port) {
      setPortAvailable(null)
      setIsCheckingPort(false)
      return
    }
    if (port < 1024 || port > 65535) {
      setPortAvailable(false)
      return
    }

    setIsCheckingPort(true)
    if (portCheckTimer.current) clearTimeout(portCheckTimer.current)

    portCheckTimer.current = setTimeout(async () => {
      try {
        const result = await window.api.mockCheckPort(port)
        setPortAvailable(result.available)
      } catch {
        setPortAvailable(false)
      } finally {
        setIsCheckingPort(false)
      }
    }, 300)

    return () => {
      if (portCheckTimer.current) clearTimeout(portCheckTimer.current)
    }
  }, [port, server])

  const isRunning = useMemo(
    () => runningServers.some((rs) => rs.server_id === selectedServerId),
    [runningServers, selectedServerId]
  )

  const baseUrl = `http://localhost:${port}`

  const handleSave = useCallback(async () => {
    if (!server) return
    await updateServer(server.id, name, port, selectedProjectId)
  }, [server, name, port, selectedProjectId, updateServer])

  const handleToggleServer = useCallback(async () => {
    if (!server) return
    if (isRunning) {
      await stopServer(server.id)
    } else {
      await startServer(server.id)
    }
  }, [server, isRunning, startServer, stopServer])

  const handleNameBlur = useCallback(() => {
    if (!server) return
    if (name !== server.name) handleSave()
  }, [server, name, handleSave])

  const handlePortBlur = useCallback(() => {
    if (!server) return
    if (port !== server.port && portAvailable !== false) handleSave()
  }, [server, port, portAvailable, handleSave])

  const handleProjectChange = useCallback(
    async (projectId: string) => {
      setSelectedProjectId(projectId)
      if (!server) return
      await updateServer(server.id, name, port, projectId)
    },
    [server, name, port, updateServer]
  )

  const handleCopyBaseUrl = useCallback(() => {
    navigator.clipboard.writeText(baseUrl)
  }, [baseUrl])

  return {
    server,
    name,
    setName,
    port,
    setPort,
    portAvailable,
    isCheckingPort,
    isRunning,
    baseUrl,
    projects,
    selectedProjectId,
    handleNameBlur,
    handlePortBlur,
    handleToggleServer,
    handleProjectChange,
    handleCopyBaseUrl,
  }
}
