import type { McpConnectionStatus } from '../McpServersPanel.types'

export function getStatusDotClass(status: McpConnectionStatus): string {
  switch (status) {
    case 'connected':
      return 'w-2 h-2 rounded-full bg-emerald-500'
    case 'connecting':
      return 'w-2 h-2 rounded-full bg-amber-500 animate-pulse'
    case 'error':
      return 'w-2 h-2 rounded-full bg-destructive'
    case 'disconnected':
      return 'w-2 h-2 rounded-full bg-muted-foreground/40'
  }
}
