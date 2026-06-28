import { useCallback, useMemo } from 'react'
import { useSettingsStore } from '@/store/settings-store'
import type { PanelAIConfig } from '@/store/panel-ai-config.types'
import { DEFAULT_PANEL_AI_CONFIG } from '@/store/panel-ai-config.constants'
import { PANEL_ENTRIES } from './AiPanelToolsSetting.constants'

export function useAiPanelToolsSettingData() {
  const chatModel = useSettingsStore((s) => s.chatModel)
  const panelAIConfigs = useSettingsStore((s) => s.panelAIConfigs)
  const setPanelAIConfig = useSettingsStore((s) => s.setPanelAIConfig)

  const configs = useMemo(
    () =>
      PANEL_ENTRIES.map((entry) => ({
        ...entry,
        config: { ...DEFAULT_PANEL_AI_CONFIG, ...panelAIConfigs[entry.id] },
      })),
    [panelAIConfigs],
  )

  const handleConfigChange = useCallback(
    (appId: string, partial: Partial<PanelAIConfig>) => {
      setPanelAIConfig(appId, partial)
    },
    [setPanelAIConfig],
  )

  return { configs, chatModel, handleConfigChange }
}
