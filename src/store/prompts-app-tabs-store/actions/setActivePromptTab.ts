import type { PromptsAppTabsStoreSetter } from '../types'

/**
 * Switch the active tab. Pass `null` to activate the permanent Browse tab.
 */
export function setActivePromptTabAction(
  set: PromptsAppTabsStoreSetter,
  id: string | null,
): void {
  set({ activePromptTabId: id })
}
