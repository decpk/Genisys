import { API_CLIENT_TABS_STORAGE_PREFIX } from '../tabs.constants'

/** Builds the workspace-scoped localStorage key for persisted request tabs. */
export function buildTabsStorageKey(workspaceId: string): string {
  return `${API_CLIENT_TABS_STORAGE_PREFIX}${workspaceId}`
}
