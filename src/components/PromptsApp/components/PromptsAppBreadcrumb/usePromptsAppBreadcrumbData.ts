import { useCallback, useMemo } from 'react'

import { usePromptManagerStore } from '@/store/prompt-manager-store'
import { usePromptsAppTabsStore } from '@/store/prompts-app-tabs-store'

import type { PromptsAppData } from '../../PromptsApp.types'
import type { PromptsAppBreadcrumbData } from './PromptsAppBreadcrumb.types'

/**
 * Resolves the active prompt and its folder/category for the breadcrumb
 * row, and provides handlers that jump back to Browse with the selected
 * folder/category pre-filtered.
 */
export function usePromptsAppBreadcrumbData(
  data: PromptsAppData,
): PromptsAppBreadcrumbData {
  const activePromptTabId = usePromptsAppTabsStore((s) => s.activePromptTabId)
  const setActivePromptTab = usePromptsAppTabsStore((s) => s.setActivePromptTab)
  const prompts = usePromptManagerStore((s) => s.prompts)

  const activePrompt = useMemo(() => {
    if (!activePromptTabId) return null
    return prompts.find((p) => p.id === activePromptTabId) ?? null
  }, [prompts, activePromptTabId])

  const folder = useMemo(() => {
    if (!activePrompt) return undefined
    return data.folders.find((f) => f.id === activePrompt.folderId)
  }, [data.folders, activePrompt])

  const category = useMemo(() => {
    if (!activePrompt) return undefined
    return data.categories.find((c) => c.id === activePrompt.categoryId)
  }, [data.categories, activePrompt])

  const handleSelectFolder = useCallback(() => {
    if (!folder) return
    data.setActiveFolderId(folder.id)
    setActivePromptTab(null)
  }, [data, folder, setActivePromptTab])

  const handleSelectCategory = useCallback(() => {
    if (!category) return
    data.setActiveFolderId(category.folderId)
    data.setActiveCategoryId(category.id)
    setActivePromptTab(null)
  }, [data, category, setActivePromptTab])

  return {
    activePrompt,
    folder,
    category,
    handleSelectFolder,
    handleSelectCategory,
  }
}
