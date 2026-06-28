import type { McpServerSummary } from '../McpServersPanel.types'

export async function disconnectMcpServer(name: string): Promise<McpServerSummary[]> {
  const result = await window.api.mcpDisconnectServer(name)
  return Array.isArray(result) ? result : []
}
