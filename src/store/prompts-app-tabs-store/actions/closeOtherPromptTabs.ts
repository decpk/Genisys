import type {
  PromptsAppTabsState,
  PromptsAppTabsStoreSetter,
} from '../types'

/**
 * Close every prompt tab except the one matching `keepId`, then activate
 * the kept tab. Used by the tab context-menu "Close Others" action.
 */
export function closeOtherPromptTabsAction(
  get: () => PromptsAppTabsState,
  set: PromptsAppTabsStoreSetter,
  keepId: string,
): void {
  const { openPromptTabs } = get()
  if (!openPromptTabs.includes(keepId)) return

  set({
    openPromptTabs: [keepId],
    activePromptTabId: keepId,
  })
}
