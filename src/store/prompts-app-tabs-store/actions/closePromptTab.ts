import type {
  PromptsAppTabsState,
  PromptsAppTabsStoreSetter,
} from '../types'

/**
 * Remove a prompt tab from the open list. If the closed tab was active,
 * auto-switch to the neighbour at the same index (or the previous one if
 * the closed tab was last). When no prompt tabs remain, activate the
 * Browse tab (represented by `null`).
 */
export function closePromptTabAction(
  get: () => PromptsAppTabsState,
  set: PromptsAppTabsStoreSetter,
  id: string,
): void {
  const { openPromptTabs, activePromptTabId } = get()
  const idx = openPromptTabs.indexOf(id)
  if (idx === -1) return

  const next = openPromptTabs.filter((tabId) => tabId !== id)

  let newActive = activePromptTabId
  if (activePromptTabId === id) {
    if (next.length === 0) {
      newActive = null
    } else {
      newActive = next[Math.min(idx, next.length - 1)] ?? null
    }
  }

  set({
    openPromptTabs: next,
    activePromptTabId: newActive,
  })
}
