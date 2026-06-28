import type { McpServerSummary } from '../../McpServersPanel.types'
import type { McpToolItem } from '../../McpServersPanel.types'

export interface McpServerCardProps {
  server: McpServerSummary
  isExpanded: boolean
  tools: McpToolItem[]
  loadingTools: boolean
  connectingName: string | null
  onToggleExpand: (name: string) => void
  onConnect: (name: string) => void
  onDisconnect: (name: string) => void
}
