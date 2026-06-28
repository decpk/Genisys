import { create } from 'zustand'

import { closeAllPromptTabsAction } from './prompts-app-tabs-store/actions/closeAllPromptTabs'
import { closeOtherPromptTabsAction } from './prompts-app-tabs-store/actions/closeOtherPromptTabs'
import { closePromptTabAction } from './prompts-app-tabs-store/actions/closePromptTab'
import { openPromptTabAction } from './prompts-app-tabs-store/actions/openPromptTab'
import { pruneOrphanPromptTabsAction } from './prompts-app-tabs-store/actions/pruneOrphanPromptTabs'
import { reorderPromptTabsAction } from './prompts-app-tabs-store/actions/reorderPromptTabs'
import { setActivePromptTabAction } from './prompts-app-tabs-store/actions/setActivePromptTab'
import type { PromptsAppTabsStore } from './prompts-app-tabs-store/types'

/**
 * In-memory multi-tab store scoped to the standalone PromptsApp surface.
 * Open tabs are NOT persisted across app restarts — that is intentional
 * and matches the MockServer tab pattern. See
 * `prompts-app-tabs-store/types.ts` for the state shape and action
 * contracts; each action lives in its own file under
 * `prompts-app-tabs-store/actions/`.
 */
export const usePromptsAppTabsStore = create<PromptsAppTabsStore>()((set, get) => ({
  // ── State ──────────────────────────────────────────────────────
  openPromptTabs: [],
  activePromptTabId: null,

  // ── Actions (thin wrappers; logic lives in actions/*.ts) ──────
  openPromptTab: (id) => openPromptTabAction(get, set, id),
  closePromptTab: (id) => closePromptTabAction(get, set, id),
  setActivePromptTab: (id) => setActivePromptTabAction(set, id),
  closeOtherPromptTabs: (keepId) => closeOtherPromptTabsAction(get, set, keepId),
  closeAllPromptTabs: () => closeAllPromptTabsAction(set),
  reorderPromptTabs: (ids) => reorderPromptTabsAction(set, ids),
  pruneOrphanPromptTabs: (existingIds) =>
    pruneOrphanPromptTabsAction(get, set, existingIds),
}))

export type { PromptsAppTabsStore } from './prompts-app-tabs-store/types'
