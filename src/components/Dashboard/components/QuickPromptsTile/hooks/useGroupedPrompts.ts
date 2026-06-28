import { useEffect, useMemo } from 'react'

import { usePromptManagerStore, type PmCategory, type PmFolder, type PmPrompt } from '@/store/prompt-manager-store'

export interface PromptTreeCategoryNode {
  category: PmCategory
  prompts: PmPrompt[]
}

export interface PromptTreeFolderNode {
  folder: PmFolder
  categories: PromptTreeCategoryNode[]
  totalPrompts: number
}

export interface UseGroupedPromptsResult {
  folders: PromptTreeFolderNode[]
  pinnedPrompts: PmPrompt[]
  totalAvailable: number
  pinnedCount: number
  isLoaded: boolean
}

/**
 * Builds a folder → category → prompt tree from the PromptManager store,
 * mirroring the structure used in the Chat right-panel `PmExplorerTree`.
 *
 * Also surfaces the user's pinned prompts as a separate list so the dashboard
 * tile can show them together at the top.
 */
export function useGroupedPrompts(): UseGroupedPromptsResult {
  const folders = usePromptManagerStore((s) => s.folders)
  const categories = usePromptManagerStore((s) => s.categories)
  const prompts = usePromptManagerStore((s) => s.prompts)
  const isLoaded = usePromptManagerStore((s) => s.isLoaded)
  const loadAll = usePromptManagerStore((s) => s.loadAll)

  useEffect(() => {
    if (!isLoaded) void loadAll()
  }, [isLoaded, loadAll])

  return useMemo(() => {
    const sortedFolders = [...folders].sort((a, b) => a.sortOrder - b.sortOrder)

    const tree: PromptTreeFolderNode[] = sortedFolders.map((folder) => {
      const folderCategories = categories
        .filter((c) => c.folderId === folder.id)
        .sort((a, b) => a.sortOrder - b.sortOrder)

      let totalPrompts = 0
      const categoryNodes: PromptTreeCategoryNode[] = folderCategories.map((cat) => {
        const catPrompts = prompts
          .filter((p) => p.categoryId === cat.id)
          .sort((a, b) => a.sortOrder - b.sortOrder)
        totalPrompts += catPrompts.length
        return { category: cat, prompts: catPrompts }
      })

      return { folder, categories: categoryNodes, totalPrompts }
    })

    const pinnedPrompts = prompts
      .filter((p) => p.isPinned)
      .sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )

    return {
      folders: tree,
      pinnedPrompts,
      totalAvailable: prompts.length,
      pinnedCount: pinnedPrompts.length,
      isLoaded,
    }
  }, [folders, categories, prompts, isLoaded])
}
