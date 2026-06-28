import type { PmPrompt } from '@/store/prompt-manager-store'
import type { PromptScopeApp } from './promptScope.types'

/**
 * Returns `true` if the prompt is available on the given app surface.
 *
 * Backward-compat: a prompt with `undefined` or empty `appScopes` is available
 * everywhere (the previous behavior before per-prompt scoping was introduced).
 */
export function isPromptInScope(prompt: PmPrompt, app: PromptScopeApp): boolean {
  const scopes = prompt.appScopes
  if (!scopes || scopes.length === 0) return true
  return scopes.includes(app)
}
