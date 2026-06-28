import { buildTabsStorageKey } from './buildTabsStorageKey'
import type { PersistedApiClientTabs } from '../tabs.types'

const EMPTY_TABS: PersistedApiClientTabs = { openRequestTabs: [], activeRequestTabId: null }

/**
 * Reads persisted request tabs for a workspace from localStorage.
 * Returns an empty tab set when nothing is stored or parsing fails.
 */
export function readTabs(workspaceId: string): PersistedApiClientTabs {
  try {
    const raw = localStorage.getItem(buildTabsStorageKey(workspaceId))
    if (!raw) return EMPTY_TABS
    const parsed = JSON.parse(raw) as PersistedApiClientTabs
    if (!Array.isArray(parsed.openRequestTabs)) return EMPTY_TABS
    return {
      openRequestTabs: parsed.openRequestTabs,
      activeRequestTabId: parsed.activeRequestTabId ?? null,
    }
  } catch {
    return EMPTY_TABS
  }
}
