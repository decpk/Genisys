import type { McpServerSummary } from '../McpServersSetting.types'

export async function removeMcpServer(name: string): Promise<McpServerSummary[]> {
  const result = await window.api.mcpRemoveServer(name)
  return Array.isArray(result) ? result : []
}
