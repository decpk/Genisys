import { useCallback, useEffect, useMemo, useState } from 'react'

import {
  usePromptManagerStore,
  type PmFolder,
  type PmCategory,
  type PmPrompt,
} from '@/store/prompt-manager-store'

// ─── Types ──────────────────────────────────────────────────────

interface DialogState {
  promptDialog: { open: boolean; prompt?: PmPrompt; categoryId?: string; folderId?: string }
  folderDialog: { open: boolean; folder?: PmFolder }
  categoryDialog: { open: boolean; folderId?: string; category?: PmCategory }
  moveDialog: { open: boolean; prompt?: PmPrompt }
  importDialog: boolean
  viewerDialog: { open: boolean; prompt: PmPrompt | null }
}

export interface PromptsPanelHook {
  // Data
  folders: PmFolder[]
  categories: PmCategory[]
  prompts: PmPrompt[]
  isLoaded: boolean
  activeFolderId: string | null
  activeFolder: PmFolder | undefined
  searchQuery: string
  filteredPrompts: PmPrompt[]
  groupedByCategory: { category: PmCategory; prompts: PmPrompt[] }[] | null
  totalCount: number

  // Navigation
  setActiveFolderId: (id: string) => void
  setSearchQuery: (q: string) => void

  // Dialogs
  dialogs: DialogState
  openPromptDialog: (opts?: { prompt?: PmPrompt; categoryId?: string; folderId?: string }) => void
  openFolderDialog: (folder?: PmFolder) => void
  openCategoryDialog: (folderId?: string, category?: PmCategory) => void
  openMoveDialog: (prompt: PmPrompt) => void
  openImportDialog: () => void
  openViewerDialog: (prompt: PmPrompt) => void
  closeDialog: (key: keyof DialogState) => void

  // Actions
  handleUse: (prompt: PmPrompt) => void
  handleCopy: (prompt: PmPrompt) => void
  removeFolder: (id: string) => void
  removeCategory: (id: string) => void
  removePrompt: (id: string) => void
}

// ─── Hook ───────────────────────────────────────────────────────

export function usePromptsPanel(): PromptsPanelHook {
  const folders = usePromptManagerStore((s) => s.folders)
  const categories = usePromptManagerStore((s) => s.categories)
  const prompts = usePromptManagerStore((s) => s.prompts)
  const isLoaded = usePromptManagerStore((s) => s.isLoaded)
  const loadAll = usePromptManagerStore((s) => s.loadAll)
  const storeFolderId = usePromptManagerStore((s) => s.activeFolderId)
  const storeSetFolderId = usePromptManagerStore((s) => s.setActiveFolderId)
  const storeSetCategoryId = usePromptManagerStore((s) => s.setActiveCategoryId)
  const searchQuery = usePromptManagerStore((s) => s.searchQuery)
  const setSearchQuery = usePromptManagerStore((s) => s.setSearchQuery)
  const removeFolder = usePromptManagerStore((s) => s.removeFolder)
  const removeCategory = usePromptManagerStore((s) => s.removeCategory)
  const removePrompt = usePromptManagerStore((s) => s.removePrompt)

  // ── Load on mount ─────────────────────────────────────────────
  useEffect(() => {
    if (!isLoaded) loadAll()
  }, [isLoaded, loadAll])

  // ── Dialogs ───────────────────────────────────────────────────
  const [dialogs, setDialogs] = useState<DialogState>({
    promptDialog: { open: false },
    folderDialog: { open: false },
    categoryDialog: { open: false },
    moveDialog: { open: false },
    importDialog: false,
    viewerDialog: { open: false, prompt: null },
  })

  const openPromptDialog = useCallback(
    (opts?: { prompt?: PmPrompt; categoryId?: string; folderId?: string }) => {
      setDialogs((d) => ({
        ...d,
        promptDialog: {
          open: true,
          prompt: opts?.prompt,
          categoryId: opts?.categoryId,
          folderId: opts?.folderId ?? storeFolderId ?? undefined,
        },
      }))
    },
    [storeFolderId],
  )

  const openFolderDialog = useCallback((folder?: PmFolder) => {
    setDialogs((d) => ({ ...d, folderDialog: { open: true, folder } }))
  }, [])

  const openCategoryDialog = useCallback((folderId?: string, category?: PmCategory) => {
    setDialogs((d) => ({ ...d, categoryDialog: { open: true, folderId, category } }))
  }, [])

  const openMoveDialog = useCallback((prompt: PmPrompt) => {
    setDialogs((d) => ({ ...d, moveDialog: { open: true, prompt } }))
  }, [])

  const openImportDialog = useCallback(() => {
    setDialogs((d) => ({ ...d, importDialog: true }))
  }, [])

  const openViewerDialog = useCallback((prompt: PmPrompt) => {
    setDialogs((d) => ({ ...d, viewerDialog: { open: true, prompt } }))
  }, [])

  const closeDialog = useCallback((key: keyof DialogState) => {
    setDialogs((d) => {
      if (key === 'importDialog') return { ...d, importDialog: false }
      if (key === 'viewerDialog') return { ...d, viewerDialog: { open: false, prompt: null } }
      return { ...d, [key]: { open: false } }
    })
  }, [])

  // ── Folder selection ──────────────────────────────────────────
  const setActiveFolderId = useCallback(
    (id: string) => {
      storeSetFolderId(id)
      storeSetCategoryId(null)
    },
    [storeSetFolderId, storeSetCategoryId],
  )

  const activeFolder = useMemo(
    () => folders.find((f) => f.id === storeFolderId),
    [folders, storeFolderId],
  )

  // Only chat-scoped prompts (undefined scope treated as chat) show here.
  const chatPrompts = useMemo(
    () => prompts.filter((p) => !p.scope || p.scope === 'chat'),
    [prompts],
  )

  // ── Filtering ─────────────────────────────────────────────────
  const filteredPrompts = useMemo(() => {
    let result = chatPrompts

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.content.toLowerCase().includes(q),
      )
    } else if (storeFolderId) {
      result = result.filter((p) => p.folderId === storeFolderId)
    }

    return result.sort((a, b) => a.sortOrder - b.sortOrder)
  }, [chatPrompts, storeFolderId, searchQuery])

  const groupedByCategory = useMemo(() => {
    if (searchQuery.trim()) return null
    if (!storeFolderId) return null

    const folderCategories = categories
      .filter((c) => c.folderId === storeFolderId)
      .sort((a, b) => a.sortOrder - b.sortOrder)

    return folderCategories.map((cat) => ({
      category: cat,
      prompts: chatPrompts
        .filter((p) => p.categoryId === cat.id)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    }))
  }, [categories, chatPrompts, storeFolderId, searchQuery])

  // ── Chat injection ────────────────────────────────────────────
  const handleUse = useCallback((prompt: PmPrompt) => {
    const editor = (window as unknown as Record<string, unknown>).__chatEditor as import('@tiptap/react').Editor | undefined
    if (!editor) return
    const content = prompt.content.replace(/\{\{[^}]+\}\}/g, '')
    editor.commands.insertContent(content)
    editor.commands.focus()
    // Show the start of the inserted text. `insertContent` parks the cursor
    // at the END of the inserted nodes, and tiptap's `focus()` calls
    // `scrollIntoView` against that cursor — so without this the user lands
    // at the bottom of a long prompt inside the capped, scrollable editor.
    // Cursor stays at the end so typing still appends to the prompt. Double
    // rAF waits for the editor's own height-cap rAF + the browser layout
    // flush from focus's scrollIntoView.
    const dom = editor.view.dom
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (dom instanceof HTMLElement) dom.scrollTop = 0
      })
    })
  }, [])

  const handleCopy = useCallback(async (prompt: PmPrompt) => {
    await navigator.clipboard.writeText(prompt.content)
  }, [])

  return {
    folders,
    categories,
    prompts,
    isLoaded,
    activeFolderId: storeFolderId,
    activeFolder,
    searchQuery,
    filteredPrompts,
    groupedByCategory,
    totalCount: prompts.length,

    setActiveFolderId,
    setSearchQuery,

    dialogs,
    openPromptDialog,
    openFolderDialog,
    openCategoryDialog,
    openMoveDialog,
    openImportDialog,
    openViewerDialog,
    closeDialog,

    handleUse,
    handleCopy,
    removeFolder,
    removeCategory,
    removePrompt,
  }
}
