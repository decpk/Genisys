import { useCallback, useEffect, useMemo, useState } from 'react'
import { scopedToast } from '@/frameworks/notification'

const toast = scopedToast('prompts')

import {
  usePromptManagerStore,
  type PmFolder,
  type PmCategory,
  type PmPrompt,
} from '@/store/prompt-manager-store'
import { useConfirmDialogStore } from '@/store/confirm-dialog-store'
import { usePromptsAppTabsStore } from '@/store/prompts-app-tabs-store'

import type {
  PromptsAppData,
  PromptsAppDialogKey,
  PromptsAppDialogState,
} from '../PromptsApp.types'
import { usePromptsAppTabsOrphanPrune } from './usePromptsAppTabsOrphanPrune'

const EMPTY_PROMPTS: PmPrompt[] = []
const EMPTY_CATEGORIES: PmCategory[] = []

/**
 * Aggregates store data, search/filter state and dialog plumbing for the
 * standalone Prompts app. Most of this hook mirrors `usePromptsPanel`
 * (the in-Chat panel) but adds an `activeCategoryId` filter slice and
 * routing helpers that target the standalone app surface.
 */
export function usePromptsAppData(): PromptsAppData {
  // ── Store selectors ───────────────────────────────────────────
  const folders = usePromptManagerStore((s) => s.folders)
  const categories = usePromptManagerStore((s) => s.categories)
  const prompts = usePromptManagerStore((s) => s.prompts)
  const isLoaded = usePromptManagerStore((s) => s.isLoaded)
  const loadAll = usePromptManagerStore((s) => s.loadAll)
  const searchQuery = usePromptManagerStore((s) => s.searchQuery)
  const setSearchQuery = usePromptManagerStore((s) => s.setSearchQuery)
  const storeFolderId = usePromptManagerStore((s) => s.activeFolderId)
  const storeSetFolderId = usePromptManagerStore((s) => s.setActiveFolderId)
  const storeCategoryId = usePromptManagerStore((s) => s.activeCategoryId)
  const storeSetCategoryId = usePromptManagerStore((s) => s.setActiveCategoryId)
  const removeFolderAction = usePromptManagerStore((s) => s.removeFolder)
  const removeCategoryAction = usePromptManagerStore((s) => s.removeCategory)
  const removePromptAction = usePromptManagerStore((s) => s.removePrompt)
  const setActivePromptTab = usePromptsAppTabsStore((s) => s.setActivePromptTab)

  // ── Bootstrap data ────────────────────────────────────────────
  useEffect(() => {
    if (!isLoaded) loadAll()
  }, [isLoaded, loadAll])

  // ── Keep open prompt tabs in sync with the prompt collection ──
  usePromptsAppTabsOrphanPrune()

  // ── Dialog state ──────────────────────────────────────────────
  const [dialogs, setDialogs] = useState<PromptsAppDialogState>({
    promptDialog: { open: false },
    folderDialog: { open: false },
    categoryDialog: { open: false },
    moveDialog: { open: false },
    importDialog: false,
  })

  const openPromptDialog = useCallback(
    (opts?: { prompt?: PmPrompt; categoryId?: string; folderId?: string }) => {
      setDialogs((d) => ({
        ...d,
        promptDialog: {
          open: true,
          prompt: opts?.prompt,
          categoryId: opts?.categoryId ?? storeCategoryId ?? undefined,
          folderId: opts?.folderId ?? storeFolderId ?? undefined,
        },
      }))
    },
    [storeFolderId, storeCategoryId],
  )

  const openFolderDialog = useCallback((folder?: PmFolder) => {
    setDialogs((d) => ({ ...d, folderDialog: { open: true, folder } }))
  }, [])

  const openCategoryDialog = useCallback(
    (folderId?: string, category?: PmCategory) => {
      setDialogs((d) => ({
        ...d,
        categoryDialog: { open: true, folderId, category },
      }))
    },
    [],
  )

  const openMoveDialog = useCallback((prompt: PmPrompt) => {
    setDialogs((d) => ({ ...d, moveDialog: { open: true, prompt } }))
  }, [])

  const openImportDialog = useCallback(() => {
    setDialogs((d) => ({ ...d, importDialog: true }))
  }, [])

  const closeDialog = useCallback((key: PromptsAppDialogKey) => {
    setDialogs((d) => {
      if (key === 'importDialog') return { ...d, importDialog: false }
      return { ...d, [key]: { open: false } }
    })
  }, [])

  // ── Folder + category counts ──────────────────────────────────
  const folderPromptCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const p of prompts) {
      counts[p.folderId] = (counts[p.folderId] ?? 0) + 1
    }
    return counts
  }, [prompts])

  // ── Active scope derived data ─────────────────────────────────
  const activeFolder = useMemo(
    () => folders.find((f) => f.id === storeFolderId),
    [folders, storeFolderId],
  )

  const activeFolderCategories = useMemo(() => {
    if (!storeFolderId) return EMPTY_CATEGORIES
    return categories
      .filter((c) => c.folderId === storeFolderId)
      .sort((a, b) => a.sortOrder - b.sortOrder)
  }, [categories, storeFolderId])

  const activeFolderPromptCount = useMemo(() => {
    if (!storeFolderId) return 0
    return folderPromptCounts[storeFolderId] ?? 0
  }, [folderPromptCounts, storeFolderId])

  // ── Filtering ─────────────────────────────────────────────────
  const isSearching = !!searchQuery.trim()

  const filteredPrompts = useMemo<PmPrompt[]>(() => {
    let result = prompts

    if (isSearching) {
      const q = searchQuery.trim().toLowerCase()
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.content.toLowerCase().includes(q),
      )
    } else {
      if (storeFolderId) {
        result = result.filter((p) => p.folderId === storeFolderId)
      }
      if (storeCategoryId) {
        result = result.filter((p) => p.categoryId === storeCategoryId)
      }
    }

    if (result.length === 0) return EMPTY_PROMPTS
    return [...result].sort((a, b) => {
      // Most recently updated first for searches; preserve sort order otherwise.
      if (isSearching) {
        return (
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
      }
      return a.sortOrder - b.sortOrder
    })
  }, [prompts, storeFolderId, storeCategoryId, searchQuery, isSearching])

  // ── Navigation ────────────────────────────────────────────────
  const setActiveFolderId = useCallback(
    (id: string | null) => {
      storeSetFolderId(id)
      storeSetCategoryId(null)
      // Selecting a collection returns the user to the Browse tab so they see
      // the collection's contents instead of staying on an open prompt viewer.
      setActivePromptTab(null)
    },
    [storeSetFolderId, storeSetCategoryId, setActivePromptTab],
  )

  const setActiveCategoryId = useCallback(
    (id: string | null) => {
      storeSetCategoryId(id)
    },
    [storeSetCategoryId],
  )

  // ── Actions: copy / delete ────────────────────────────────────
  const handleCopyPrompt = useCallback(async (prompt: PmPrompt) => {
    await navigator.clipboard.writeText(prompt.content)
    toast.success('Copied to clipboard', {
      description: prompt.title || 'Prompt content copied',
    })
  }, [])

  const openConfirm = useConfirmDialogStore((s) => s.openConfirmDialog)

  const removeFolder = useCallback(
    (id: string) => {
      openConfirm({
        title: 'Delete folder',
        description:
          'Delete this folder and all of its categories and prompts? This cannot be undone.',
        onConfirm: () => {
          removeFolderAction(id)
        },
      })
    },
    [openConfirm, removeFolderAction],
  )

  const removeCategory = useCallback(
    (id: string) => {
      openConfirm({
        title: 'Delete category',
        description:
          'Delete this category and all of its prompts? This cannot be undone.',
        onConfirm: () => {
          removeCategoryAction(id)
        },
      })
    },
    [openConfirm, removeCategoryAction],
  )

  const removePrompt = useCallback(
    (id: string) => {
      openConfirm({
        title: 'Delete prompt',
        description: 'Delete this prompt? This cannot be undone.',
        onConfirm: () => {
          removePromptAction(id)
        },
      })
    },
    [openConfirm, removePromptAction],
  )

  // ── Pop-out: launch standalone window via Tauri webview ───────
  const popOutToNewWindow = useCallback(() => {
    const api = (window as unknown as { api?: { openAppInNewWindow?: (app: string, label: string) => Promise<unknown> } }).api
    if (!api?.openAppInNewWindow) {
      toast.error('Cannot open new window', {
        description: 'Tauri APIs are not available in this build.',
      })
      return
    }
    api.openAppInNewWindow('prompts', 'Prompts').catch((err: unknown) => {
      toast.error('Failed to open new window', {
        description: err instanceof Error ? err.message : 'Unknown error',
      })
    })
  }, [])

  return {
    isLoaded,
    folders,
    categories,
    prompts,
    totalPromptCount: prompts.length,
    totalFolderCount: folders.length,
    activeFolderId: storeFolderId,
    activeFolder,
    activeCategoryId: storeCategoryId,
    activeFolderCategories,
    activeFolderPromptCount,
    activeFolderCategoryCount: activeFolderCategories.length,
    searchQuery,
    setSearchQuery,
    isSearching,
    filteredPrompts,
    folderPromptCounts,
    setActiveFolderId,
    setActiveCategoryId,
    dialogs,
    openPromptDialog,
    openFolderDialog,
    openCategoryDialog,
    openMoveDialog,
    openImportDialog,
    closeDialog,
    handleCopyPrompt,
    removeFolder,
    removeCategory,
    removePrompt,
    popOutToNewWindow,
  }
}
