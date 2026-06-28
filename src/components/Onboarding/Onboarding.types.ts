export interface McpSyncResult {
  added: string[]
  skipped: string[]
  connected: number
  failed: number
}

export interface AppShowcaseItem {
  id: string
  icon: React.ComponentType<{ size: number }>
  label: string
  description: string
}

export type McpSyncState = 'idle' | 'syncing' | 'done' | 'error' | 'skipped'
