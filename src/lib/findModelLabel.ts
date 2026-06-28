import type { ModelOption } from '@/components/Chat/components/ModelSelector/ModelSelector.types'

/**
 * Resolve a human-readable label for a model id, checking the live model list
 * first, then a static fallback list, finally degrading to the raw id.
 */
export function findModelLabel(
  liveModels: ModelOption[],
  fallbackModels: ModelOption[],
  modelId: string,
): string {
  const live = liveModels.find((m) => m.id === modelId)
  if (live) return live.label
  const fallback = fallbackModels.find((m) => m.id === modelId)
  if (fallback) return fallback.label
  return modelId
}
