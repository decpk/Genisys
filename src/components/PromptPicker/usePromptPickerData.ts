import { useEffect, useMemo, useState } from 'react'

import { getFoldersForApp, isPromptInScope } from '@/lib/prompt-scope'
import { usePromptManagerStore } from '@/store/prompt-manager-store'

import { filterPromptsBySearch } from './utils/filterPromptsBySearch'
import { groupPromptsByFolder, type PromptPickerFolderGroup } from './utils/groupPromptsByFolder'
import type { PromptPickerProps } from './PromptPicker.types'

export interface UsePromptPickerDataResult {
  query: string
  setQuery: (q: string) => void
  groups: PromptPickerFolderGroup[]
  totalPrompts: number
  isLoaded: boolean
}

/**
 * Orchestrator hook for `PromptPicker`. Selects primitives off the zustand
 * store, then derives folder/category/prompt groupings for the active app.
 *
 * Pitfall guard: never select a fresh object/array literal — each call
 * pulls a stable store reference, then derives via `useMemo`.
 */
export function usePromptPickerData(appId: PromptPickerProps['appId']): UsePromptPickerDataResult {
  const folders = usePromptManagerStore((s) => s.folders)
  const categories = usePromptManagerStore((s) => s.categories)
  const prompts = usePromptManagerStore((s) => s.prompts)
  const isLoaded = usePromptManagerStore((s) => s.isLoaded)
  const loadAll = usePromptManagerStore((s) => s.loadAll)

  // Trigger the one-shot store hydration on mount. Without this, opening the
  // picker before any other prompt-manager surface (PromptsApp / PromptsPanel)
  // mounts leaves `isLoaded === false` forever → stuck on "Loading prompts…".
  useEffect(() => {
    if (!isLoaded) loadAll()
  }, [isLoaded, loadAll])

  const [query, setQuery] = useState('')

  const scopedFolders = useMemo(() => getFoldersForApp(folders, appId), [folders, appId])

  // Drop prompts whose folder is out of scope.
  const visiblePrompts = useMemo(() => {
    const allowed = new Set(scopedFolders.map((f) => f.id))
    return prompts.filter((p) => {
      if (!allowed.has(p.folderId)) return false
      if (!isPromptInScope(p, appId)) return false
      return true
    })
  }, [prompts, scopedFolders, appId])

  const searched = useMemo(() => filterPromptsBySearch(visiblePrompts, query), [visiblePrompts, query])

  const groups = useMemo(
    () => groupPromptsByFolder(scopedFolders, categories, searched),
    [scopedFolders, categories, searched],
  )

  return {
    query,
    setQuery,
    groups,
    totalPrompts: searched.length,
    isLoaded,
  }
}
