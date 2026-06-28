import { useSettingsStore } from '@/store/settings-store'
import { DEFAULT_PANEL_AI_CONFIG } from '@/store/panel-ai-config.constants'
import { pickBestModelId } from '@/components/Chat/components/ModelSelector/ModelSelector.constants'

/**
 * Resolve the effective AI model id for a given app/panel.
 *
 * Precedence:
 *   1. Per-app override — `panelAIConfigs[appId].model` (set in Settings)
 *   2. Global default — `chatModel` (the "Default AI Model" setting)
 *
 * Read at call-time (via `getState()`, not a React selector) so a model
 * change in Settings is picked up on the next request without forcing the
 * caller to re-subscribe / re-render. Always returns a concrete model id
 * because `chatModel` is guaranteed to be set, so callers never need their
 * own hardcoded fallback.
 *
 * @param appId Panel/app identifier (e.g. `'chat'`, `'reviewer'`, `'code'`).
 */
export function resolveAppModel(appId: string): string {
  const state = useSettingsStore.getState()
  const merged = { ...DEFAULT_PANEL_AI_CONFIG, ...state.panelAIConfigs[appId] }
  const candidate = merged.model ?? state.chatModel
  return ensureAvailableModel(candidate, state.chatModel, state.availableModelIds)
}

/**
 * Guard a model id against the live available-model list.
 *
 * If the list is known (non-empty) and `candidate` is not in it, the model is
 * stale — the provider catalog dropped it and the request would be rejected.
 * In that case fall back to `globalModel` when it is itself valid, otherwise
 * the best available model. When the list is
 * unknown (empty: not yet fetched, or offline) the candidate is returned
 * unchanged so behaviour never regresses.
 */
export function ensureAvailableModel(
  candidate: string,
  globalModel: string,
  availableIds: string[],
): string {
  if (availableIds.length === 0) return candidate
  if (availableIds.includes(candidate)) return candidate
  if (availableIds.includes(globalModel)) return globalModel
  return pickBestModelId(availableIds)
}

/** appId used for the clipboard image-analysis (vision) model override. */
export const CLIPBOARD_VISION_APP_ID = 'clipboard-vision'

/**
 * Default vision model for clipboard image analysis. gpt-4.1 vision works on
 * both consumer and enterprise provider endpoints (gpt-4o vision is rejected on
 * some enterprise proxies). Used when the user hasn't picked a model.
 */
export const CLIPBOARD_VISION_DEFAULT_MODEL = 'gpt-4.1'

/**
 * Resolve the model used for clipboard image analysis.
 *
 * Unlike {@link resolveAppModel}, this does NOT fall back to the global
 * `chatModel` (which may not support vision). When no override is set it falls
 * back to {@link CLIPBOARD_VISION_DEFAULT_MODEL}, a known vision-capable model.
 */
export function resolveClipboardVisionModel(): string {
  const state = useSettingsStore.getState()
  const candidate =
    state.panelAIConfigs[CLIPBOARD_VISION_APP_ID]?.model ??
    CLIPBOARD_VISION_DEFAULT_MODEL
  return ensureAvailableModel(
    candidate,
    CLIPBOARD_VISION_DEFAULT_MODEL,
    state.availableModelIds,
  )
}
