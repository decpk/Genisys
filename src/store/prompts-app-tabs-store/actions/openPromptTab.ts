import type {
  PromptsAppTabsState,
  PromptsAppTabsStoreSetter,
} from '../types'

/**
 * Add a prompt to the open-tabs list (if not already open) and make it active.
 * Mirrors the MockServer `openEndpointTab` behaviour: existing tabs are not
 * duplicated, and clicking a tab that is already open just re-activates it.
 */
export function openPromptTabAction(
  get: () => PromptsAppTabsState,
  set: PromptsAppTabsStoreSetter,
  id: string,
): void {
  const { openPromptTabs } = get()
  if (!openPromptTabs.includes(id)) {
    set({ openPromptTabs: [...openPromptTabs, id] })
  }
  set({ activePromptTabId: id })
}
