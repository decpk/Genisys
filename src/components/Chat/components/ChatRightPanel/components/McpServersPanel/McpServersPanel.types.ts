export type McpConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

export interface McpServerSummary {
  name: string
  status: McpConnectionStatus
  toolCount: number
  error: string | null
}

export interface McpToolItem {
  name: string
  description: string
}

export type McpToolsMap = Record<string, McpToolItem[]>
