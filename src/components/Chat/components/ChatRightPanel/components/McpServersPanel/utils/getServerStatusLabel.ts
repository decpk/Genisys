import type { McpConnectionStatus } from '../McpServersPanel.types'

export function getServerStatusLabel(status: McpConnectionStatus): string {
  switch (status) {
    case 'connected':
      return 'Connected'
    case 'error':
      return 'Error'
    case 'connecting':
      return 'Connecting…'
    case 'disconnected':
      return 'Disconnected'
  }
}
