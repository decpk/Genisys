import { useEffect, useState } from 'react'

import { useSettingsStore } from '@/store/settings-store'
import type { ModelOption } from '../ModelSelector.types'
import {
  groupModelsByProvider,
  pickBestModel,
  resolveLiveModels
} from '../ModelSelector.constants'

export function useModelSelector(selectedModelId: string, onModelChange?: (id: string) => void) {
  // Start with an empty list — the predefined `DEFAULT_MODELS` would otherwise
  // briefly render labels/IDs that may not actually be available from the
  // configured providers. We wait for the fetch and show only available models.
  const [models, setModels] = useState<ModelOption[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    window.api
      .getAiProviders()
      .then((providers) => {
        if (cancelled) return
        const liveModels = resolveLiveModels(providers)
        if (liveModels.length > 0) {
          setModels(liveModels)
          // Keep the store's live-model cache fresh for send-time validation.
          useSettingsStore.getState().setAvailableModelIds(liveModels.map((m) => m.id))
          // Auto-select best model if current selection isn't available
          if (!liveModels.some((m) => m.id === selectedModelId) && onModelChange) {
            onModelChange(pickBestModel(liveModels))
          }
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const selected = models.find((m) => m.id === selectedModelId) ?? models[0]
  const groups = groupModelsByProvider(models)

  return { selected, groups, isLoading }
}
