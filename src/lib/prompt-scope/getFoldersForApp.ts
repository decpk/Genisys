import type { PmFolder } from '@/store/prompt-manager-store'
import { isFolderInScope } from './isFolderInScope'
import type { PromptScopeApp } from './promptScope.types'

/**
 * Filter a list of folders down to those that should appear on a given
 * app surface. Folders without explicit scopes are included for every app.
 */
export function getFoldersForApp(folders: PmFolder[], app: PromptScopeApp): PmFolder[] {
  return folders.filter((folder) => isFolderInScope(folder, app))
}
