import type { PromptsAppTabsStoreSetter } from '../types'

/**
 * Replace the entire open-tabs order. Used by drag-and-drop reordering
 * (UI not wired yet — kept here so the store API stays symmetrical with
 * MockServer's tab system).
 */
export function reorderPromptTabsAction(
  set: PromptsAppTabsStoreSetter,
  ids: string[],
): void {
  set({ openPromptTabs: ids })
}
