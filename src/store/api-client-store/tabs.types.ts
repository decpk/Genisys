/**
 * Shape persisted to localStorage for the API Client multi-tab feature.
 * Scoped per workspace so each workspace restores its own open tabs.
 */
export interface PersistedApiClientTabs {
  openRequestTabs: string[]
  activeRequestTabId: string | null
}
