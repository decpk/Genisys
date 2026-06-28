import type { PmPrompt } from '@/store/prompt-manager-store'

import { EXPLORER_FOLDER } from '../EXPLORER_FOLDER'
import { EXPLORER_NOW } from '../constants/explorerPromptDefaults'

/**
 * Caller-supplied fields for a built-in Explorer prompt. Everything that is
 * identical across the entire library (folder ID, timestamps, `isBuiltIn`,
 * `isPinned`) is filled in by the helper so each prompt file stays minimal
 * and declarative.
 */
export interface BuildExplorerPromptArgs {
  /**
   * Stable ID — must be unique across all built-in prompts. Convention:
   * `p-exp-builtin-CCNN-slug`, where CC is the two-digit category number
   * and NN is the two-digit prompt number within that category.
   */
  id: string
  /** Parent category ID — must reference an entry in EXPLORER_CATEGORIES. */
  categoryId: string
  /** Display title, ≤ 60 chars. */
  title: string
  /** One-sentence summary shown in the picker. */
  description: string
  /**
   * Markdown body inserted into the AI editor on click. May contain
   * `{{placeholder}}` tokens; `stripPromptTemplate()` removes them before
   * insertion so the user sees a clean instruction with the placeholder
   * stripped (and can type their own value in its place).
   */
  content: string
  /**
   * Sort order within the category — lower = higher in the picker. Use
   * 10-step increments (10, 20, 30, …) so future inserts have room.
   */
  sortOrder: number
}

/**
 * Factory that hydrates a partial prompt spec into a fully-formed
 * `PmPrompt` record bound to the Explorer Library folder. Keeping this in
 * one place means a future schema change (e.g. a new required field on
 * `PmPrompt`) only needs to be patched here, not across 40 prompt files.
 */
export function buildExplorerPrompt(args: BuildExplorerPromptArgs): PmPrompt {
  return {
    id: args.id,
    folderId: EXPLORER_FOLDER.id,
    categoryId: args.categoryId,
    title: args.title,
    description: args.description,
    content: args.content,
    isPinned: false,
    sortOrder: args.sortOrder,
    createdAt: EXPLORER_NOW,
    updatedAt: EXPLORER_NOW,
    isBuiltIn: true,
  }
}
