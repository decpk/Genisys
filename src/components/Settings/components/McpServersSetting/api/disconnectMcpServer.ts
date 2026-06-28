import type { McpServerSummary } from '../McpServersSetting.types'

export async function disconnectMcpServer(name: string): Promise<McpServerSummary[]> {
  const result = await window.api.mcpDisconnectServer(name)
  return Array.isArray(result) ? result : []
}
