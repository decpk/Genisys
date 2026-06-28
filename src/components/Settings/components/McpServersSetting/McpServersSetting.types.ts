export interface McpServerInfo {
  name: string
  version?: string
}

export type McpConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

export interface McpServerSummary {
  name: string
  status: McpConnectionStatus
  serverInfo: McpServerInfo | null
  toolCount: number
  error: string | null
}

export interface McpServerFormData {
  name: string
  command: string
  args: string
  env: string
  enabled: boolean
}

export type McpSettingsView = "servers" | "presets" | "import";
