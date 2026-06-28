import { create } from 'zustand'

import type { PromptScopeApp } from '@/lib/prompt-scope/promptScope.types'

import { loadAppData, patchAppData } from './app-data'

import {
  EXPLORER_CATEGORIES,
  EXPLORER_FOLDER,
  EXPLORER_PROMPTS,
} from '@/prompts/promptLibraryExplorer'
import { LIBRARY_CATEGORIES, LIBRARY_FOLDER, LIBRARY_PROMPTS } from '@/prompts/promptLibrarySeeds'
import {
  TEACHER_STUDENT_CATEGORIES,
  TEACHER_STUDENT_FOLDER,
  TEACHER_STUDENT_PROMPTS,
} from '@/prompts/promptLibraryTeacherStudentSeeds'
import { NOTES_CATEGORIES, NOTES_FOLDER, NOTES_PROMPTS } from '@/prompts/promptLibraryNotesSeeds'
import {
  PROMPT_ENGINEERING_CATEGORIES,
  PROMPT_ENGINEERING_FOLDER,
  PROMPT_ENGINEERING_PROMPTS,
} from '@/prompts/promptLibraryPromptEngineeringSeeds'
import {
  LOOP_ENGINEERING_CATEGORIES,
  LOOP_ENGINEERING_FOLDER,
  LOOP_ENGINEERING_PROMPTS,
} from '@/prompts/promptLibraryLoopEngineeringSeeds'

const ALL_BUILTIN_FOLDERS = [
  LIBRARY_FOLDER,
  TEACHER_STUDENT_FOLDER,
  EXPLORER_FOLDER,
  NOTES_FOLDER,
  PROMPT_ENGINEERING_FOLDER,
  LOOP_ENGINEERING_FOLDER,
]
const ALL_BUILTIN_CATEGORIES = [
  ...LIBRARY_CATEGORIES,
  ...TEACHER_STUDENT_CATEGORIES,
  ...EXPLORER_CATEGORIES,
  ...NOTES_CATEGORIES,
  ...PROMPT_ENGINEERING_CATEGORIES,
  ...LOOP_ENGINEERING_CATEGORIES,
]
const ALL_BUILTIN_PROMPTS = [
  ...LIBRARY_PROMPTS,
  ...TEACHER_STUDENT_PROMPTS,
  ...EXPLORER_PROMPTS,
  ...NOTES_PROMPTS,
  ...PROMPT_ENGINEERING_PROMPTS,
  ...LOOP_ENGINEERING_PROMPTS,
]

/**
 * Persist the tombstone list of deleted built-in ids to app-data. Built-ins
 * are re-injected from code on every load, so this is what makes a built-in
 * deletion stick across reloads (see `loadAll`).
 */
function persistHiddenBuiltInIds(next: string[]): void {
  void patchAppData((d) => {
    if (!d.promptManager) d.promptManager = { hiddenBuiltInIds: [] }
    d.promptManager.hiddenBuiltInIds = next
  })
}

// ─── Types ──────────────────────────────────────────────────────

export interface PmFolder {
  id: string
  name: string
  color: string
  /**
   * AppView ids this folder is scoped to. Empty / undefined means the folder
   * is available on every prompt-aware surface (backward-compatible default).
   */
  scopes?: string[]
  isBuiltIn?: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface PmCategory {
  id: string
  folderId: string
  name: string
  icon: string
  isBuiltIn?: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

/**
 * Visibility scope for a prompt.
 *
 * - `chat` (or undefined) — surfaced in the Chat right panel Prompts list.
 *
 * The field is optional so legacy / user-created prompts (which never set it)
 * keep their previous chat-visible behavior.
 */
export type PmPromptScope = 'chat'

export interface PmPrompt {
  id: string
  categoryId: string
  folderId: string
  title: string
  content: string
  description: string
  isPinned: boolean
  isBuiltIn?: boolean
  scope?: PmPromptScope
  /**
   * AppView ids this prompt is restricted to. Empty / undefined means the
   * prompt is visible in every app surface (backward-compatible default).
   * Independent of the coarse `scope` field above.
   */
  appScopes?: PromptScopeApp[]
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export type PmViewMode = 'folder' | 'category' | 'all'

// ─── State ──────────────────────────────────────────────────────

interface PmState {
  folders: PmFolder[]
  categories: PmCategory[]
  prompts: PmPrompt[]
  /**
   * Ids of built-in folders/categories/prompts the user has deleted. Built-ins
   * are re-injected from code on every load, so these tombstones are persisted
   * in app-data and filtered out in `loadAll`.
   */
  hiddenBuiltInIds: string[]
  isLoaded: boolean
  activeFolderId: string | null
  activeCategoryId: string | null
  activePromptId: string | null
  viewMode: PmViewMode
  searchQuery: string
}

interface PmActions {
  loadAll: () => Promise<void>
  reset: () => void

  // Folders
  addFolder: (name: string, color?: string, scopes?: string[]) => Promise<PmFolder>
  updateFolder: (id: string, updates: Partial<Pick<PmFolder, 'name' | 'color' | 'scopes'>>) => Promise<void>
  removeFolder: (id: string) => Promise<void>

  // Categories
  addCategory: (folderId: string, name: string, icon?: string) => Promise<PmCategory>
  updateCategory: (id: string, updates: Partial<Pick<PmCategory, 'name' | 'icon'>>) => Promise<void>
  removeCategory: (id: string) => Promise<void>

  // Prompts
  addPrompt: (categoryId: string, folderId: string, title: string, content: string, description?: string, appScopes?: PromptScopeApp[]) => Promise<PmPrompt>
  updatePrompt: (id: string, updates: Partial<Pick<PmPrompt, 'title' | 'content' | 'description' | 'appScopes'>>) => Promise<void>
  removePrompt: (id: string) => Promise<void>
  movePrompt: (promptId: string, targetCategoryId: string, targetFolderId: string) => Promise<void>

  // Defaults
  ensureDefaults: () => Promise<{ folderId: string; categoryId: string }>

  // Import
  importFolder: (
    folder: Omit<PmFolder, 'sortOrder'>,
    categories: Omit<PmCategory, 'folderId' | 'sortOrder'>[],
    prompts: Omit<PmPrompt, 'folderId' | 'categoryId' | 'sortOrder' | 'isPinned'>[],
    catMap: Record<string, string[]>,
  ) => Promise<void>
  importPrompt: (
    prompt: Omit<PmPrompt, 'folderId' | 'categoryId' | 'sortOrder' | 'isPinned'>,
    targetCategoryId: string,
    targetFolderId: string,
  ) => Promise<void>

  // Navigation
  setActiveFolderId: (id: string | null) => void
  setActiveCategoryId: (id: string | null) => void
  setActivePromptId: (id: string | null) => void
  setViewMode: (mode: PmViewMode) => void
  setSearchQuery: (query: string) => void
}

// In-flight dedupe for `loadAll`. The `isLoaded` flag only flips to `true`
// *after* the async `pmLoadAll()` resolves, so several surfaces that mount on
// the same tick (PromptPicker, QuickPromptsTile, AutoReviewer, AI tools) all
// pass the `isLoaded` guard and each fire their own `cmd_pm_load_all`. Caching
// the in-flight promise makes concurrent callers share a single invoke.
let loadAllInFlight: Promise<void> | null = null

export const usePromptManagerStore = create<PmState & PmActions>()((set, get) => ({
  folders: [],
  categories: [],
  prompts: [],
  hiddenBuiltInIds: [],
  isLoaded: false,
  activeFolderId: null,
  activeCategoryId: null,
  activePromptId: null,
  viewMode: 'folder',
  searchQuery: '',

  loadAll: async () => {
    if (get().isLoaded) return
    // A load is already running — await the same promise instead of firing a
    // second `cmd_pm_load_all`.
    if (loadAllInFlight) return loadAllInFlight

    loadAllInFlight = (async () => {
      // Tombstoned built-in ids — persisted separately from the prompt DB so a
      // deleted built-in folder/category/prompt stays gone across reloads.
      let hiddenBuiltInIds: string[] = []
      try {
        const appData = await loadAppData()
        hiddenBuiltInIds = appData.promptManager?.hiddenBuiltInIds ?? []
      } catch {
        hiddenBuiltInIds = []
      }
      const hidden = new Set(hiddenBuiltInIds)

      try {
        const data = (await window.api.pmLoadAll()) as {
          folders: PmFolder[]
          categories: PmCategory[]
          prompts: PmPrompt[]
        }

        const folders = [
          ...ALL_BUILTIN_FOLDERS.filter((bf) => !hidden.has(bf.id)).map((bf) => {
            // Built-ins always use the in-code definition, but a persisted
            // override for `scopes` (set via the FolderDialog) is restored here
            // so user-chosen scopes survive a reload.
            const persisted = data.folders.find((f) => f.id === bf.id)
            if (persisted && Array.isArray(persisted.scopes) && persisted.scopes.length > 0) {
              return { ...bf, scopes: persisted.scopes }
            }
            return bf
          }),
          ...data.folders.filter((folder) => !ALL_BUILTIN_FOLDERS.some((bf) => bf.id === folder.id)),
        ]
        const categories = [
          ...ALL_BUILTIN_CATEGORIES.filter((bc) => !hidden.has(bc.id)),
          ...data.categories.filter((category) => !ALL_BUILTIN_CATEGORIES.some((bc) => bc.id === category.id)),
        ]
        const prompts = [
          ...ALL_BUILTIN_PROMPTS.filter((bp) => !hidden.has(bp.id)),
          ...data.prompts.filter((prompt) => !ALL_BUILTIN_PROMPTS.some((bp) => bp.id === prompt.id)),
        ]

        set({
          folders,
          categories,
          prompts,
          hiddenBuiltInIds,
          isLoaded: true,
          activeFolderId: folders[0]?.id ?? null,
        })
      } catch {
        const folders = ALL_BUILTIN_FOLDERS.filter((bf) => !hidden.has(bf.id))
        set({
          folders,
          categories: ALL_BUILTIN_CATEGORIES.filter((bc) => !hidden.has(bc.id)),
          prompts: ALL_BUILTIN_PROMPTS.filter((bp) => !hidden.has(bp.id)),
          hiddenBuiltInIds,
          isLoaded: true,
          activeFolderId: folders[0]?.id ?? LIBRARY_FOLDER.id,
        })
      }
    })()

    try {
      await loadAllInFlight
    } finally {
      loadAllInFlight = null
    }
  },

  reset: () => {
    loadAllInFlight = null
    set({
      folders: [],
      categories: [],
      prompts: [],
      hiddenBuiltInIds: [],
      isLoaded: false,
      activeFolderId: null,
      activeCategoryId: null,
      activePromptId: null,
      searchQuery: '',
    })
  },

  // ── Folders ──────────────────────────────────────────────────

  addFolder: async (name, color = '', scopes) => {
    const now = new Date().toISOString()
    const folder: PmFolder = {
      id: crypto.randomUUID(),
      name,
      color,
      scopes: scopes && scopes.length > 0 ? scopes : [],
      sortOrder: get().folders.length,
      createdAt: now,
      updatedAt: now,
    }
    set((s) => ({ folders: [...s.folders, folder] }))
    await window.api.pmSaveFolder(folder)
    return folder
  },

  updateFolder: async (id, updates) => {
    const folder = get().folders.find((f) => f.id === id)
    if (!folder) return
    // Built-in folders can still have their scopes adjusted (so users can
    // restrict the Library / Teacher-Student / CodeReview folder to specific
    // apps), but name/color edits are not allowed.
    let allowed = updates
    if (folder.isBuiltIn) {
      if (!('scopes' in updates) || updates.scopes === undefined) return
      allowed = { scopes: updates.scopes }
    }
    const updated = { ...folder, ...allowed, updatedAt: new Date().toISOString() }
    set((s) => ({ folders: s.folders.map((f) => (f.id === id ? updated : f)) }))
    await window.api.pmSaveFolder(updated)
  },

  removeFolder: async (id) => {
    const { folders, categories, prompts } = get()
    const folder = folders.find((f) => f.id === id)
    if (!folder) return

    const childCategories = categories.filter((c) => c.folderId === id)
    const childPrompts = prompts.filter((p) => p.folderId === id)

    // Built-in ids get tombstoned (so they don't re-seed); user-created items
    // are removed from the DB.
    const builtInIds: string[] = []
    if (folder.isBuiltIn) builtInIds.push(folder.id)
    for (const c of childCategories) if (c.isBuiltIn) builtInIds.push(c.id)
    for (const p of childPrompts) if (p.isBuiltIn) builtInIds.push(p.id)

    set((s) => ({
      folders: s.folders.filter((f) => f.id !== id),
      categories: s.categories.filter((c) => c.folderId !== id),
      prompts: s.prompts.filter((p) => p.folderId !== id),
      activeFolderId: s.activeFolderId === id ? (s.folders.find((f) => f.id !== id)?.id ?? null) : s.activeFolderId,
      activeCategoryId: s.activeCategoryId && s.categories.find((c) => c.id === s.activeCategoryId)?.folderId === id ? null : s.activeCategoryId,
      activePromptId: s.activePromptId && s.prompts.find((p) => p.id === s.activePromptId)?.folderId === id ? null : s.activePromptId,
    }))

    if (builtInIds.length > 0) {
      const merged = Array.from(new Set([...get().hiddenBuiltInIds, ...builtInIds]))
      set({ hiddenBuiltInIds: merged })
      persistHiddenBuiltInIds(merged)
    }

    // Remove any user-created descendants from the DB so they don't reload as
    // orphans pointing at a now-deleted folder.
    if (!folder.isBuiltIn) {
      await window.api.pmRemoveFolder(id)
    } else {
      for (const c of childCategories) if (!c.isBuiltIn) await window.api.pmRemoveCategory(c.id)
      for (const p of childPrompts) if (!p.isBuiltIn) await window.api.pmRemovePrompt(p.id)
    }
  },

  // ── Categories ───────────────────────────────────────────────

  addCategory: async (folderId, name, icon = '') => {
    const now = new Date().toISOString()
    const existing = get().categories.filter((c) => c.folderId === folderId)
    const category: PmCategory = {
      id: crypto.randomUUID(),
      folderId,
      name,
      icon,
      sortOrder: existing.length,
      createdAt: now,
      updatedAt: now,
    }
    set((s) => ({ categories: [...s.categories, category] }))
    await window.api.pmSaveCategory(category)
    return category
  },

  updateCategory: async (id, updates) => {
    const cat = get().categories.find((c) => c.id === id)
    if (!cat) return
    if (cat.isBuiltIn) return
    const updated = { ...cat, ...updates, updatedAt: new Date().toISOString() }
    set((s) => ({ categories: s.categories.map((c) => (c.id === id ? updated : c)) }))
    await window.api.pmSaveCategory(updated)
  },

  removeCategory: async (id) => {
    const { categories, prompts } = get()
    const category = categories.find((c) => c.id === id)
    if (!category) return

    const childPrompts = prompts.filter((p) => p.categoryId === id)

    const builtInIds: string[] = []
    if (category.isBuiltIn) builtInIds.push(category.id)
    for (const p of childPrompts) if (p.isBuiltIn) builtInIds.push(p.id)

    set((s) => ({
      categories: s.categories.filter((c) => c.id !== id),
      prompts: s.prompts.filter((p) => p.categoryId !== id),
      activeCategoryId: s.activeCategoryId === id ? null : s.activeCategoryId,
      activePromptId: s.activePromptId && s.prompts.find((p) => p.id === s.activePromptId)?.categoryId === id ? null : s.activePromptId,
    }))

    if (builtInIds.length > 0) {
      const merged = Array.from(new Set([...get().hiddenBuiltInIds, ...builtInIds]))
      set({ hiddenBuiltInIds: merged })
      persistHiddenBuiltInIds(merged)
    }

    if (!category.isBuiltIn) {
      await window.api.pmRemoveCategory(id)
    } else {
      for (const p of childPrompts) if (!p.isBuiltIn) await window.api.pmRemovePrompt(p.id)
    }
  },

  // ── Prompts ──────────────────────────────────────────────────

  addPrompt: async (categoryId, folderId, title, content, description = '', appScopes) => {
    const now = new Date().toISOString()
    const existing = get().prompts.filter((p) => p.categoryId === categoryId)
    const prompt: PmPrompt = {
      id: crypto.randomUUID(),
      categoryId,
      folderId,
      title,
      content,
      description,
      isPinned: false,
      appScopes: appScopes && appScopes.length > 0 ? appScopes : undefined,
      sortOrder: existing.length,
      createdAt: now,
      updatedAt: now,
    }
    set((s) => ({ prompts: [...s.prompts, prompt] }))
    await window.api.pmSavePrompt(prompt)
    return prompt
  },

  updatePrompt: async (id, updates) => {
    const prompt = get().prompts.find((p) => p.id === id)
    if (!prompt) return
    if (prompt.isBuiltIn) return
    const updated = { ...prompt, ...updates, updatedAt: new Date().toISOString() }
    set((s) => ({ prompts: s.prompts.map((p) => (p.id === id ? updated : p)) }))
    await window.api.pmSavePrompt(updated)
  },

  removePrompt: async (id) => {
    const prompt = get().prompts.find((p) => p.id === id)
    if (!prompt) return
    set((s) => ({
      prompts: s.prompts.filter((p) => p.id !== id),
      activePromptId: s.activePromptId === id ? null : s.activePromptId,
    }))
    if (prompt.isBuiltIn) {
      const merged = Array.from(new Set([...get().hiddenBuiltInIds, id]))
      set({ hiddenBuiltInIds: merged })
      persistHiddenBuiltInIds(merged)
    } else {
      await window.api.pmRemovePrompt(id)
    }
  },

  movePrompt: async (promptId, targetCategoryId, targetFolderId) => {
    const prompt = get().prompts.find((p) => p.id === promptId)
    if (!prompt) return
    if (prompt.isBuiltIn) return
    const now = new Date().toISOString()
    const targetPrompts = get().prompts.filter((p) => p.categoryId === targetCategoryId)
    const updated = {
      ...prompt,
      categoryId: targetCategoryId,
      folderId: targetFolderId,
      sortOrder: targetPrompts.length,
      updatedAt: now,
    }
    set((s) => ({ prompts: s.prompts.map((p) => (p.id === promptId ? updated : p)) }))
    await window.api.pmSavePrompt(updated)
  },

  // ── Defaults ──────────────────────────────────────────────────

  ensureDefaults: async () => {
    const { folders, categories, addFolder, addCategory } = get()
    let folder = folders.find((f) => !f.isBuiltIn)
    if (!folder) {
      folder = await addFolder('Untitled')
      set({ activeFolderId: folder.id })
    }
    let category = categories.find((c) => c.folderId === folder.id)
    if (!category) {
      category = await addCategory(folder.id, 'General')
    }
    return { folderId: folder.id, categoryId: category.id }
  },

  // ── Import ────────────────────────────────────────────────────

  importFolder: async (folderData, categoriesData, promptsData, catMap) => {
    const now = new Date().toISOString()
    const newFolderId = crypto.randomUUID()

    const folder: PmFolder = {
      ...folderData,
      id: newFolderId,
      sortOrder: get().folders.length,
      createdAt: now,
      updatedAt: now,
    }

    // Build old→new category ID mapping
    const catIdMap = new Map<string, string>()
    const newCategories: PmCategory[] = categoriesData.map((c, i) => {
      const newId = crypto.randomUUID()
      catIdMap.set(c.id, newId)
      return {
        ...c,
        id: newId,
        folderId: newFolderId,
        sortOrder: i,
        createdAt: now,
        updatedAt: now,
      }
    })

    // Build prompts with remapped IDs
    const newPrompts: PmPrompt[] = []
    for (const [oldCatId, promptIds] of Object.entries(catMap)) {
      const newCatId = catIdMap.get(oldCatId)
      if (!newCatId) continue
      for (let i = 0; i < promptIds.length; i++) {
        const orig = promptsData.find((p) => p.id === promptIds[i])
        if (!orig) continue
        newPrompts.push({
          ...orig,
          id: crypto.randomUUID(),
          folderId: newFolderId,
          categoryId: newCatId,
          sortOrder: i,
          isPinned: false,
          createdAt: now,
          updatedAt: now,
        })
      }
    }

    set((s) => ({
      folders: [...s.folders, folder],
      categories: [...s.categories, ...newCategories],
      prompts: [...s.prompts, ...newPrompts],
    }))

    // Persist
    await window.api.pmSaveFolder(folder)
    for (const c of newCategories) await window.api.pmSaveCategory(c)
    for (const p of newPrompts) await window.api.pmSavePrompt(p)
  },

  importPrompt: async (promptData, targetCategoryId, targetFolderId) => {
    const now = new Date().toISOString()
    const existing = get().prompts.filter((p) => p.categoryId === targetCategoryId)
    const prompt: PmPrompt = {
      ...promptData,
      id: crypto.randomUUID(),
      folderId: targetFolderId,
      categoryId: targetCategoryId,
      sortOrder: existing.length,
      isPinned: false,
      createdAt: now,
      updatedAt: now,
    }
    set((s) => ({ prompts: [...s.prompts, prompt] }))
    await window.api.pmSavePrompt(prompt)
  },

  // ── Navigation ───────────────────────────────────────────────

  setActiveFolderId: (id) => set({ activeFolderId: id, activeCategoryId: null, activePromptId: null }),
  setActiveCategoryId: (id) => set({ activeCategoryId: id, activePromptId: null }),
  setActivePromptId: (id) => set({ activePromptId: id }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setSearchQuery: (query) => set({ searchQuery: query }),
}))
