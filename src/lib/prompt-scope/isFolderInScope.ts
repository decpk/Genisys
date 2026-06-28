import type { PmFolder } from '@/store/prompt-manager-store'
import type { PromptScopeApp } from './promptScope.types'

/**
 * Returns `true` if the folder is available on the given app surface.
 *
 * Backward-compat: a folder with `undefined` or empty `scopes` is available
 * everywhere (the previous behavior before scoping was introduced).
 */
export function isFolderInScope(folder: PmFolder, app: PromptScopeApp): boolean {
  const scopes = folder.scopes
  if (!scopes || scopes.length === 0) return true
  return scopes.includes(app)
}
