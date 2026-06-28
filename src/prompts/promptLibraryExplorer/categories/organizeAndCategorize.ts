import type { PmCategory } from '@/store/prompt-manager-store'

import { EXPLORER_FOLDER } from '../EXPLORER_FOLDER'
import { EXPLORER_NOW } from '../constants/explorerPromptDefaults'

/**
 * Category 1 — prompts that help the user impose structure on a messy
 * folder: grouping files by type/date/source, suggesting subfolder layouts,
 * moving files matching a pattern.
 *
 * All prompts in this category propose a plan first and rely on the
 * Explorer AI's confirmation flow before any move/rename is executed.
 */
export const organizeAndCategorize: PmCategory = {
  id: 'c-exp-builtin-0001',
  folderId: EXPLORER_FOLDER.id,
  name: 'Organize & Categorize',
  icon: '',
  sortOrder: 0,
  createdAt: EXPLORER_NOW,
  updatedAt: EXPLORER_NOW,
  isBuiltIn: true,
}
