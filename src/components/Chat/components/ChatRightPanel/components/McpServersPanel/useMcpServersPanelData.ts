import { useState, useEffect, useCallback, useRef } from 'react'

import type { McpServerSummary } from './McpServersPanel.types'
import { computeMcpCounts } from './utils/computeMcpCounts'

import type { McpToolsMap } from './McpServersPanel.types'
import { fetchMcpServers } from './api/fetchMcpServers'
import { fetchMcpTools } from './api/fetchMcpTools'
import { connectMcpServer } from './api/connectMcpServer'
import { disconnectMcpServer } from './api/disconnectMcpServer'
import { groupToolsByServer } from './utils/groupToolsByServer'

export function useMcpServersPanelData() {
  const [servers, setServers] = useState<McpServerSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedServer, setExpandedServer] = useState<string | null>(null)
  const [toolsMap, setToolsMap] = useState<McpToolsMap>({})
  const [loadingTools, setLoadingTools] = useState(false)
  const [connectingName, setConnectingName] = useState<string | null>(null)

  const toolsCacheRef = useRef<McpToolsMap>({})

  // ── Initial fetch ──────────────────────────────────────
  useEffect(() => {
    fetchMcpServers()
      .then(setServers)
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  // ── Real-time updates via mcp-status-changed event ─────
  useEffect(() => {
    const cleanup = window.api.onMcpStatusChanged((data: unknown) => {
      if (!Array.isArray(data)) return
      setServers(data)
      setIsLoading(false)

      // Invalidate tool cache when server status changes
      toolsCacheRef.current = {}
      setToolsMap({})
    })
    return cleanup
  }, [])

  // ── Toggle expand / load tools ─────────────────────────
  const handleToggleExpand = useCallback(async (name: string) => {
    if (expandedServer === name) {
      setExpandedServer(null)
      return
    }
    setExpandedServer(name)

    if (toolsCacheRef.current[name]) return

    setLoadingTools(true)
    try {
      const { tools } = await fetchMcpTools()
      const grouped = groupToolsByServer(tools)
      toolsCacheRef.current = grouped
      setToolsMap(grouped)
    } catch {
      // silently fail — tool list stays empty
    } finally {
      setLoadingTools(false)
    }
  }, [expandedServer])

  // ── Connect server ─────────────────────────────────────
  const handleConnect = useCallback(async (name: string) => {
    setConnectingName(name)
    try {
      const updated = await connectMcpServer(name)
      setServers(updated)
      toolsCacheRef.current = {}
      setToolsMap({})
    } catch {
      // silently fail
    } finally {
      setConnectingName(null)
    }
  }, [])

  // ── Disconnect server ──────────────────────────────────
  const handleDisconnect = useCallback(async (name: string) => {
    try {
      const updated = await disconnectMcpServer(name)
      setServers(updated)
      if (expandedServer === name) setExpandedServer(null)
      toolsCacheRef.current = {}
      setToolsMap({})
    } catch {
      // silently fail
    }
  }, [expandedServer])

  const counts = computeMcpCounts(servers)

  return {
    servers,
    isLoading,
    expandedServer,
    toolsMap,
    loadingTools,
    connectingName,
    handleToggleExpand,
    handleConnect,
    handleDisconnect,
    ...counts,
  }
}
