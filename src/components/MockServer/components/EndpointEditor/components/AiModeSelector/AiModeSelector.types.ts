import type { MockEndpoint } from '@/components/MockServer/MockServer.types'

export type AiResponseMode = MockEndpoint['ai_mode']

export interface AiModeOption {
  value: AiResponseMode
  label: string
  description: string
}

export interface AiModeSelectorProps {
  mode: AiResponseMode
  onModeChange: (mode: AiResponseMode) => void
}
