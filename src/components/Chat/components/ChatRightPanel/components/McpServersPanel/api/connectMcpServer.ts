import type { McpServerSummary } from '../McpServersPanel.types'

export async function connectMcpServer(name: string): Promise<McpServerSummary[]> {
  const result = await window.api.mcpConnectServer(name)
  return Array.isArray(result) ? result : []
}
