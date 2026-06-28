import type {
  PmFolder,
  PmCategory,
  PmPrompt,
} from '@/store/prompt-manager-store'

// ── Dialog state ─────────────────────────────────────────────────────

export interface PromptsAppDialogState {
  promptDialog: { open: boolean; prompt?: PmPrompt; categoryId?: string; folderId?: string }
  folderDialog: { open: boolean; folder?: PmFolder }
  categoryDialog: { open: boolean; folderId?: string; category?: PmCategory }
  moveDialog: { open: boolean; prompt?: PmPrompt }
  importDialog: boolean
}

export type PromptsAppDialogKey = keyof PromptsAppDialogState

// ── Shape returned by usePromptsAppData ──────────────────────────────

export interface PromptsAppData {
  // Loaded state
  isLoaded: boolean

  // Raw collections
  folders: PmFolder[]
  categories: PmCategory[]
  prompts: PmPrompt[]

  // Counters
  totalPromptCount: number
  totalFolderCount: number

  // Active scope
  activeFolderId: string | null
  activeFolder: PmFolder | undefined
  activeCategoryId: string | null
  activeFolderCategories: PmCategory[]
  activeFolderPromptCount: number
  activeFolderCategoryCount: number

  // Filtering
  searchQuery: string
  setSearchQuery: (q: string) => void
  isSearching: boolean
  filteredPrompts: PmPrompt[]

  // Counts per folder (sidebar)
  folderPromptCounts: Record<string, number>

  // Navigation
  setActiveFolderId: (id: string | null) => void
  setActiveCategoryId: (id: string | null) => void

  // Dialogs
  dialogs: PromptsAppDialogState
  openPromptDialog: (opts?: {
    prompt?: PmPrompt
    categoryId?: string
    folderId?: string
  }) => void
  openFolderDialog: (folder?: PmFolder) => void
  openCategoryDialog: (folderId?: string, category?: PmCategory) => void
  openMoveDialog: (prompt: PmPrompt) => void
  openImportDialog: () => void
  closeDialog: (key: PromptsAppDialogKey) => void

  // Actions
  handleCopyPrompt: (prompt: PmPrompt) => Promise<void>
  removeFolder: (id: string) => void
  removeCategory: (id: string) => void
  removePrompt: (id: string) => void

  // Window management
  popOutToNewWindow: () => void
}
