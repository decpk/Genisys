import type { McpServerSummary } from '../McpServersPanel.types'

export async function fetchMcpServers(): Promise<McpServerSummary[]> {
  const result = await window.api.mcpListServers()
  return Array.isArray(result) ? result : []
}
