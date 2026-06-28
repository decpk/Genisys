import type { PmCategory, PmFolder, PmPrompt } from '@/store/prompt-manager-store'

export interface PromptPickerFolderGroup {
  folder: PmFolder
  categories: PromptPickerCategoryGroup[]
  /** Total number of prompts under this folder after filtering. */
  count: number
}

export interface PromptPickerCategoryGroup {
  category: PmCategory
  prompts: PmPrompt[]
}

/**
 * Groups the (already-filtered) flat prompt list back into a
 * folders → categories → prompts hierarchy in the same order the
 * underlying stores provide.
 *
 * Categories with zero prompts (after filtering) are dropped.
 * Folders with zero categories (after filtering) are also dropped.
 */
export function groupPromptsByFolder(
  folders: PmFolder[],
  categories: PmCategory[],
  prompts: PmPrompt[],
): PromptPickerFolderGroup[] {
  const promptsByCategory = new Map<string, PmPrompt[]>()
  for (const prompt of prompts) {
    const list = promptsByCategory.get(prompt.categoryId)
    if (list) list.push(prompt)
    else promptsByCategory.set(prompt.categoryId, [prompt])
  }

  const result: PromptPickerFolderGroup[] = []
  for (const folder of folders) {
    const folderCategories = categories.filter((c) => c.folderId === folder.id)
    const groups: PromptPickerCategoryGroup[] = []
    let count = 0
    for (const category of folderCategories) {
      const catPrompts = promptsByCategory.get(category.id)
      if (!catPrompts || catPrompts.length === 0) continue
      groups.push({ category, prompts: catPrompts })
      count += catPrompts.length
    }
    if (groups.length === 0) continue
    result.push({ folder, categories: groups, count })
  }
  return result
}
