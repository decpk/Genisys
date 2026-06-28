import {
  pickBestModel,
  getProviderFromModelId,
  DEFAULT_MODELS,
} from '@/components/Chat/components/ModelSelector/ModelSelector.constants'
import type { ModelOption, ModelProvider } from '@/components/Chat/components/ModelSelector/ModelSelector.types'
import type { PanelAIConfig } from '@/store/panel-ai-config.types'

interface ResolveDefaultModelParams {
  /** Whether the user has explicitly chosen the default model. */
  isUserSet: boolean
  /** The currently selected default model id. */
  currentModel: string
  /** Persist the resolved best model as the new default (without marking it user-set). */
  applyModel: (model: string) => void
  /** Cache the live available model ids for synchronous send-time validation. */
  setAvailableModelIds: (ids: string[]) => void
  /** Current per-panel AI configs, used to heal stale per-panel model overrides. */
  panelAIConfigs: Partial<Record<string, Partial<PanelAIConfig>>>
  /** Clear/replace a stale per-panel model override. */
  setPanelAIConfig: (appId: string, config: Partial<PanelAIConfig>) => void
}

/**
 * On startup, reconcile the configured AI models against the live model
 * catalog so we never send a model the configured provider no longer offers.
 *
 * It always:
 *  - caches the live model ids for synchronous send-time validation;
 *  - heals the global default when its current value is unavailable — even if
 *    the user picked it explicitly, since an unavailable model is never a valid
 *    choice — and otherwise applies the best model for non-user-set defaults;
 *  - clears stale per-panel model overrides so they fall back to the healthy
 *    global default.
 *
 * Safe to call fire-and-forget; never throws.
 */
export async function resolveDefaultModelAction(
  params: ResolveDefaultModelParams,
): Promise<void> {
  const {
    isUserSet,
    currentModel,
    applyModel,
    setAvailableModelIds,
    panelAIConfigs,
    setPanelAIConfig,
  } = params

  try {
    const providers = await window.api.getAiProviders()
    if (!providers) return

    const configured = new Set<ModelProvider>()
    if (providers.openai?.configured) configured.add('openai')
    if (providers.anthropic?.configured) configured.add('anthropic')
    if (providers.google?.configured) configured.add('google')

    const liveModels: ModelOption[] = DEFAULT_MODELS.filter((m) =>
      configured.has(m.provider),
    )
    // Custom OpenAI-compatible endpoint: surface the user-listed model ids.
    const customModels: string[] = providers.custom?.configured
      ? (providers.custom.models ?? [])
      : []
    for (const id of customModels) {
      if (id && !liveModels.some((m) => m.id === id)) {
        liveModels.push({
          id,
          label: id,
          description: 'Custom',
          provider: getProviderFromModelId(id),
        })
      }
    }

    if (!liveModels.length) return

    const liveIds = liveModels.map((m) => m.id)
    const liveIdSet = new Set(liveIds)

    // Cache for synchronous send-time validation (see resolveAppModel).
    setAvailableModelIds(liveIds)

    const best = pickBestModel(liveModels)

    // Heal the global default. Replace an unavailable model regardless of
    // whether the user set it; otherwise keep best-by-default for non-user-set.
    const currentIsAvailable = liveIdSet.has(currentModel)
    if ((!currentIsAvailable || !isUserSet) && best && best !== currentModel) {
      applyModel(best)
    }

    // Heal stale per-panel model overrides: clear any override the live catalog
    // no longer offers so it falls back to the now-healthy global default.
    for (const [appId, config] of Object.entries(panelAIConfigs)) {
      const overrideModel = config?.model
      if (overrideModel && !liveIdSet.has(overrideModel)) {
        setPanelAIConfig(appId, { model: undefined })
      }
    }
  } catch {
    // Best-effort: keep the existing config if the model list can't be fetched.
  }
}
