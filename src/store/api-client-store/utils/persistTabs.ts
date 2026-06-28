import { buildTabsStorageKey } from './buildTabsStorageKey'

/**
 * Persists the open request tabs + active tab for a workspace to localStorage.
 * All access is wrapped in try/catch — storage may be unavailable or full.
 */
export function persistTabs(
  workspaceId: string,
  openRequestTabs: string[],
  activeRequestTabId: string | null,
): void {
  try {
    localStorage.setItem(
      buildTabsStorageKey(workspaceId),
      JSON.stringify({ openRequestTabs, activeRequestTabId }),
    )
  } catch {
    /* noop — storage may be full or unavailable */
  }
}
