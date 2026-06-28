import type { PanelAIConfig } from '@/store/panel-ai-config.types'

export interface PanelConfigRowProps {
  appId: string
  appLabel: string
  config: PanelAIConfig
  chatModel: string
  onConfigChange: (appId: string, config: Partial<PanelAIConfig>) => void
}
