import type { PromptsAppTabsStoreSetter } from '../types'

/**
 * Close every prompt tab and switch the active selection back to the
 * permanent Browse tab (`null`).
 */
export function closeAllPromptTabsAction(
  set: PromptsAppTabsStoreSetter,
): void {
  set({
    openPromptTabs: [],
    activePromptTabId: null,
  })
}
