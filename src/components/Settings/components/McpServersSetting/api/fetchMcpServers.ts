import type { McpServerSummary } from '../McpServersSetting.types'

export async function fetchMcpServers(): Promise<McpServerSummary[]> {
  const result = await window.api.mcpListServers()
  return Array.isArray(result) ? result : []
}
