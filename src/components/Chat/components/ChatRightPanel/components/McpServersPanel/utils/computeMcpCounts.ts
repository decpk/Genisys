import type { McpServerSummary } from '../McpServersPanel.types'

export function computeMcpCounts(servers: McpServerSummary[]): {
  total: number
  connected: number
  errored: number
  totalTools: number
} {
  const total = servers.length
  const connected = servers.filter((s) => s.status === 'connected').length
  const errored = servers.filter((s) => s.status === 'error').length
  const totalTools = servers
    .filter((s) => s.status === 'connected')
    .reduce((sum, s) => sum + s.toolCount, 0)
  return { total, connected, errored, totalTools }
}
