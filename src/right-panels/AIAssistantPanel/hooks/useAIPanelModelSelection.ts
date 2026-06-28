import { useCallback, useMemo } from 'react'

import { ensureAvailableModel } from '@/lib/resolveAppModel'
import { useSettingsStore } from '@/store/settings-store'

interface UseAIPanelModelSelectionReturn {
  /**
   * Effective model id to show in the inline picker. Per-app override falls
   * back to the global default, then is guarded against the live model list.
   */
  selectedModelId: string
  /** Persist a new per-app model override for this panel. */
  onModelChange: (modelId: string) => void
}

/**
 * Shared model selection for any right-panel AI Assistant.
 *
 * Mirrors {@link resolveAppModel}'s precedence reactively so the inline model
 * picker shows exactly what the panel sends at request time:
 *   1. Per-app override — `panelAIConfigs[appId].model`
 *   2. Global default — `chatModel` (the "Default AI Model" setting)
 * The candidate is then guarded against the live available-model list.
 *
 * Selecting a model persists it as the per-app override via `setPanelAIConfig`,
 * so it survives reloads and stays independent from every other panel.
 *
 * @param appId Panel/app identifier (e.g. `'apex'`, `'notes'`, `'codereview'`).
 */
export function useAIPanelModelSelection(
  appId: string,
): UseAIPanelModelSelectionReturn {
  const panelConfigModel = useSettingsStore(
    (s) => s.panelAIConfigs[appId]?.model,
  )
  const chatModel = useSettingsStore((s) => s.chatModel)
  const availableModelIds = useSettingsStore((s) => s.availableModelIds)
  const setPanelAIConfig = useSettingsStore((s) => s.setPanelAIConfig)

  const selectedModelId = useMemo(
    () =>
      ensureAvailableModel(
        panelConfigModel ?? chatModel,
        chatModel,
        availableModelIds,
      ),
    [panelConfigModel, chatModel, availableModelIds],
  )

  const onModelChange = useCallback(
    (modelId: string) => {
      setPanelAIConfig(appId, { model: modelId })
    },
    [appId, setPanelAIConfig],
  )

  return { selectedModelId, onModelChange }
}
