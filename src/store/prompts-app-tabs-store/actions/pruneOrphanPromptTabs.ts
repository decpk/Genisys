import type {
  PromptsAppTabsState,
  PromptsAppTabsStoreSetter,
} from '../types'

/**
 * Defensive cleanup: drop any open-tab IDs that no longer correspond to
 * an existing prompt (e.g. the prompt was deleted from another surface
 * such as the Chat right-panel `PromptsPanel`). If the active tab was
 * orphaned, switch to a sibling or fall back to the Browse tab.
 */
export function pruneOrphanPromptTabsAction(
  get: () => PromptsAppTabsState,
  set: PromptsAppTabsStoreSetter,
  existingIds: ReadonlySet<string>,
): void {
  const { openPromptTabs, activePromptTabId } = get()

  const next = openPromptTabs.filter((id) => existingIds.has(id))
  if (next.length === openPromptTabs.length) return // nothing to prune

  let newActive = activePromptTabId
  if (activePromptTabId !== null && !existingIds.has(activePromptTabId)) {
    const oldIdx = openPromptTabs.indexOf(activePromptTabId)
    if (next.length === 0) {
      newActive = null
    } else {
      newActive = next[Math.min(oldIdx, next.length - 1)] ?? null
    }
  }

  set({
    openPromptTabs: next,
    activePromptTabId: newActive,
  })
}
