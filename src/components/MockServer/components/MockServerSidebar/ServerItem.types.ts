import type { MockServer } from '@/components/MockServer/MockServer.types'

export interface ServerItemProps {
  server: MockServer
  isSelected: boolean
  isRunning: boolean
  onClick: (serverId: string) => void
}
