import { useCallback, useMemo, useState } from 'react'

import { useSettingsStore } from '@/store/settings-store'
import { useOnDemandModelSelector } from '@/components/Chat/components/ModelSelector/hooks/useOnDemandModelSelector'
import { DEFAULT_MODELS } from '@/components/Chat/components/ModelSelector/ModelSelector.constants'
import type { ModelOption } from '@/components/Chat/components/ModelSelector/ModelSelector.types'
import { findModelLabel } from '@/lib/findModelLabel'

/**
 * Logic layer for {@link DefaultModelSetting}.
 *
 * Manages the global default AI model (`chatModel`) — the model every app
 * falls back to unless it has a per-app override. Lazily fetches the live
 * model list when the dropdown opens.
 */
export function useDefaultModelSettingData() {
  const chatModel = useSettingsStore((s) => s.chatModel)
  const setChatModel = useSettingsStore((s) => s.setChatModel)

  const [isOpen, setIsOpen] = useState(false)
  const { groups, isLoading, fetchModels } = useOnDemandModelSelector(chatModel, setChatModel)

  const allModels = useMemo<ModelOption[]>(() => groups.flatMap((g) => g.models), [groups])
  const modelLabel = findModelLabel(allModels, DEFAULT_MODELS, chatModel)

  const handleOpenChange = useCallback(
    async (open: boolean) => {
      setIsOpen(open)
      if (open) await fetchModels()
    },
    [fetchModels],
  )

  const handleModelSelect = useCallback(
    (modelId: string) => {
      setChatModel(modelId)
    },
    [setChatModel],
  )

  return {
    chatModel,
    isOpen,
    isLoading,
    allModels,
    modelLabel,
    handleOpenChange,
    handleModelSelect,
  }
}
