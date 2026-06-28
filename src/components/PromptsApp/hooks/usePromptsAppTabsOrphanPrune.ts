import { useEffect, useMemo } from 'react'

import { usePromptManagerStore } from '@/store/prompt-manager-store'
import { usePromptsAppTabsStore } from '@/store/prompts-app-tabs-store'

/**
 * Safety net that keeps the `prompts-app-tabs-store` in sync with the
 * underlying prompt collection: any tab whose prompt has been deleted
 * (here or from another surface, e.g. the Chat right-panel `PromptsPanel`)
 * is closed automatically. If the active tab is the one being orphaned,
 * the store's prune action falls back to a sibling or the Browse tab.
 *
 * Lives at the PromptsApp orchestrator level (called from
 * `usePromptsAppData`) so it mounts exactly once per app instance.
 */
export function usePromptsAppTabsOrphanPrune(): void {
  const prompts = usePromptManagerStore((s) => s.prompts)
  const pruneOrphanPromptTabs = usePromptsAppTabsStore(
    (s) => s.pruneOrphanPromptTabs,
  )

  const existingIds = useMemo(
    () => new Set(prompts.map((p) => p.id)),
    [prompts],
  )

  useEffect(() => {
    pruneOrphanPromptTabs(existingIds)
  }, [existingIds, pruneOrphanPromptTabs])
}
