import { useCallback, useMemo, useState } from 'react'

import { useSettingsStore } from '@/store/settings-store'
import { useOnDemandModelSelector } from '@/components/Chat/components/ModelSelector/hooks/useOnDemandModelSelector'
import { DEFAULT_MODELS } from '@/components/Chat/components/ModelSelector/ModelSelector.constants'
import type { ModelOption } from '@/components/Chat/components/ModelSelector/ModelSelector.types'
import { findModelLabel } from '@/lib/findModelLabel'

/**
 * Logic layer for {@link AppModelSetting}.
 *
 * Reads the per-app model override (`panelAIConfigs[appId].model`) and the
 * global default (`chatModel`), lazily fetching the live model list
 * when the dropdown opens. Selecting "Use default" clears the override
 * (`{ model: undefined }`).
 */
export function useAppModelSettingData(appId: string, defaultModelId?: string) {
  const chatModel = useSettingsStore((s) => s.chatModel)
  const overrideModel = useSettingsStore((s) => s.panelAIConfigs[appId]?.model)
  const setPanelAIConfig = useSettingsStore((s) => s.setPanelAIConfig)

  const [isOpen, setIsOpen] = useState(false)
  const { groups, isLoading, fetchModels } = useOnDemandModelSelector(chatModel)

  // The effective "default" (when no override) is the feature-specific default
  // model when provided, otherwise the global chatModel.
  const effectiveDefault = defaultModelId ?? chatModel
  const effectiveModel = overrideModel ?? effectiveDefault
  const isOverridden = overrideModel !== undefined

  const allModels = useMemo<ModelOption[]>(() => groups.flatMap((g) => g.models), [groups])

  const modelLabel = findModelLabel(allModels, DEFAULT_MODELS, effectiveModel)
  const defaultModelLabel = findModelLabel(allModels, DEFAULT_MODELS, effectiveDefault)

  const handleOpenChange = useCallback(
    async (open: boolean) => {
      setIsOpen(open)
      if (open) await fetchModels()
    },
    [fetchModels],
  )

  const handleModelSelect = useCallback(
    (modelId: string | undefined) => {
      setPanelAIConfig(appId, { model: modelId })
    },
    [appId, setPanelAIConfig],
  )

  return {
    isOpen,
    isLoading,
    allModels,
    modelLabel,
    defaultModelLabel,
    isOverridden,
    handleOpenChange,
    handleModelSelect,
  }
}
