import { useCallback, useState } from 'react'

import { useSettingsStore } from '@/store/settings-store'
import type { ModelOption } from '../ModelSelector.types'
import {
  groupModelsByProvider,
  pickBestModel,
  resolveLiveModels
} from '../ModelSelector.constants'

export function useOnDemandModelSelector(selectedModelId: string, onModelChange?: (id: string) => void) {
  const [models, setModels] = useState<ModelOption[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)

  const fetchModels = useCallback(async () => {
    if (hasLoaded || isLoading) return

    setIsLoading(true)
    try {
      const providers = await window.api.getAiProviders()
      const liveModels = resolveLiveModels(providers)
      if (liveModels.length > 0) {
        setModels(liveModels)
        setHasLoaded(true)
        // Keep the store's live-model cache fresh for send-time validation.
        useSettingsStore.getState().setAvailableModelIds(liveModels.map((m) => m.id))
        // Auto-select best model if current selection isn't available
        if (!liveModels.some((m: ModelOption) => m.id === selectedModelId) && onModelChange) {
          onModelChange(pickBestModel(liveModels))
        }
      }
    } finally {
      setIsLoading(false)
    }
  }, [hasLoaded, isLoading, selectedModelId, onModelChange])

  const selected = models.find((m: ModelOption) => m.id === selectedModelId) ?? models[0]
  const groups = groupModelsByProvider(models)

  return { selected, groups, fetchModels, isLoading }
}
