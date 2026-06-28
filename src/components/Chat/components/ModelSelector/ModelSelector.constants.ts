import type { ModelOption, ModelProvider, ModelGroup } from './ModelSelector.types'

export const PROVIDER_LABELS: Record<ModelProvider, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  google: 'Google'
} as const

/** Preferred models in priority order — first available wins as default */
export const PREFERRED_MODEL_ORDER = [
  // Anthropic Claude — newest Opus first, then Sonnet
  'claude-opus-4.8',
  'claude-opus-4.7',
  'claude-opus-4.6',
  'claude-sonnet-4.6',
  'claude-sonnet-4.5',
  // OpenAI GPT-5 / GPT-4 family
  'gpt-5.5',
  'gpt-5.4',
  'gpt-5.2',
  'gpt-4.1',
  'gpt-4o',
  // Google Gemini
  'gemini-3.1-pro-preview',
  'gemini-2.5-pro',
  // Legacy fallbacks (older deployments that may still expose these ids)
  'claude-opus-4.6-1m',
  'claude-opus-4',
  'claude-sonnet-4',
  'gemini-2.0-flash-001'
] as const

export const DEFAULT_MODELS: ModelOption[] = [
  {
    id: 'claude-opus-4.8',
    label: 'Claude Opus 4.8',
    description: 'Flagship',
    provider: 'anthropic'
  },
  {
    id: 'claude-opus-4.6',
    label: 'Claude Opus 4.6',
    description: 'High capability',
    provider: 'anthropic'
  },
  {
    id: 'claude-sonnet-4.6',
    label: 'Claude Sonnet 4.6',
    description: 'Balanced',
    provider: 'anthropic'
  },
  {
    id: 'claude-sonnet-4.5',
    label: 'Claude Sonnet 4.5',
    description: 'Balanced',
    provider: 'anthropic'
  },
  {
    id: 'claude-haiku-4.5',
    label: 'Claude Haiku 4.5',
    description: 'Fast',
    provider: 'anthropic'
  },
  { id: 'gpt-5.5', label: 'GPT-5.5', description: 'Flagship', provider: 'openai' },
  { id: 'gpt-5.4', label: 'GPT-5.4', description: 'Capable', provider: 'openai' },
  { id: 'gpt-4.1', label: 'GPT-4.1', description: '1M context', provider: 'openai' },
  { id: 'gpt-4o', label: 'GPT-4o', description: '128K context', provider: 'openai' },
  { id: 'gpt-4o-mini', label: 'GPT-4o Mini', description: 'Fast', provider: 'openai' },
  {
    id: 'gemini-3.1-pro-preview',
    label: 'Gemini 3.1 Pro',
    description: 'Flagship',
    provider: 'google'
  },
  {
    id: 'gemini-2.5-pro',
    label: 'Gemini 2.5 Pro',
    description: '1M context',
    provider: 'google'
  }
] as const

/**
 * Ultimate fallback model id when nothing else is known (offline / empty
 * live list). Chosen as a broadly-available model id.
 */
export const FALLBACK_MODEL_ID = 'gpt-4.1'

/**
 * Pick the best available model id from a list of ids, following
 * `PREFERRED_MODEL_ORDER`. Falls back to the first available id, then to
 * {@link FALLBACK_MODEL_ID} when the list is empty.
 */
export function pickBestModelId(availableIds: readonly string[]): string {
  const ids = new Set(availableIds)
  for (const id of PREFERRED_MODEL_ORDER) {
    if (ids.has(id)) return id
  }
  return availableIds[0] ?? FALLBACK_MODEL_ID
}

/** Pick the best available model from a list, following PREFERRED_MODEL_ORDER */
export function pickBestModel(available: ModelOption[]): string {
  return pickBestModelId(available.map((m) => m.id))
}

export function getProviderFromModelId(modelId: string): ModelProvider {
  if (modelId.startsWith('claude')) return 'anthropic'
  if (modelId.startsWith('gemini')) return 'google'
  return 'openai'
}

export function groupModelsByProvider(models: ModelOption[]): ModelGroup[] {
  const order: ModelProvider[] = ['anthropic', 'openai', 'google']
  const grouped = new Map<ModelProvider, ModelOption[]>()

  for (const model of models) {
    const list = grouped.get(model.provider) ?? []
    list.push(model)
    grouped.set(model.provider, list)
  }

  return order
    .filter((p) => grouped.has(p))
    .map((provider) => ({
      provider,
      label: PROVIDER_LABELS[provider],
      models: grouped.get(provider)!
    }))
}

/** Shape of the BYOK provider status returned by `getAiProviders()`. */
export interface AiProviderStatuses {
  openai?: { configured: boolean }
  anthropic?: { configured: boolean }
  google?: { configured: boolean }
  custom?: { configured: boolean; baseUrl?: string | null; models?: string[] }
}

/**
 * Resolve the list of available models from the configured BYOK providers: the
 * built-in {@link DEFAULT_MODELS} for each configured provider, plus any custom
 * OpenAI-compatible model ids the user listed.
 */
export function resolveLiveModels(
  providers: AiProviderStatuses | null | undefined
): ModelOption[] {
  if (!providers) return []

  const configured = new Set<ModelProvider>()
  if (providers.openai?.configured) configured.add('openai')
  if (providers.anthropic?.configured) configured.add('anthropic')
  if (providers.google?.configured) configured.add('google')

  const liveModels: ModelOption[] = DEFAULT_MODELS.filter((m) =>
    configured.has(m.provider)
  )

  const customModels = providers.custom?.configured ? (providers.custom.models ?? []) : []
  for (const id of customModels) {
    if (id && !liveModels.some((m) => m.id === id)) {
      liveModels.push({
        id,
        label: id,
        description: 'Custom',
        provider: getProviderFromModelId(id)
      })
    }
  }

  return liveModels
}
