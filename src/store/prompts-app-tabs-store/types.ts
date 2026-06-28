/**
 * Shared types for the `prompts-app-tabs-store` slice.
 *
 * Kept in a single file because they are pure declarations consumed by
 * both the store entry point and every `actions/*.ts` service function.
 */

export interface PromptsAppTabsState {
  /**
   * IDs of prompts currently open as tabs in the standalone PromptsApp,
   * preserving open order. The permanent "Browse" tab is represented by
   * `activePromptTabId === null` and is NOT stored in this array.
   */
  openPromptTabs: string[]

  /**
   * The currently active tab. `null` means the permanent Browse tab is
   * active; otherwise this is one of the IDs in `openPromptTabs`.
   */
  activePromptTabId: string | null
}

export interface PromptsAppTabsActions {
  openPromptTab: (id: string) => void
  closePromptTab: (id: string) => void
  setActivePromptTab: (id: string | null) => void
  closeOtherPromptTabs: (keepId: string) => void
  closeAllPromptTabs: () => void
  reorderPromptTabs: (ids: string[]) => void
  pruneOrphanPromptTabs: (existingIds: ReadonlySet<string>) => void
}

export type PromptsAppTabsStore = PromptsAppTabsState & PromptsAppTabsActions

/**
 * Zustand's `set` signature, narrowed to the partial-state shape used by
 * every action in this store. Keeping it here means each action file
 * doesn't have to redeclare the shape.
 */
export type PromptsAppTabsStoreSetter = (
  partial:
    | Partial<PromptsAppTabsState>
    | ((state: PromptsAppTabsState) => Partial<PromptsAppTabsState>),
) => void
