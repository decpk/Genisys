import type { PmCategory } from '@/store/prompt-manager-store'

import { EXPLORER_FOLDER } from '../EXPLORER_FOLDER'
import { EXPLORER_NOW } from '../constants/explorerPromptDefaults'

/**
 * Category 5 — project-hygiene checks: missing README/package.json/
 * .gitignore, .gitignore audit against common patterns, TODO/FIXME sweeps,
 * duplicate basenames across folders, listing package.json scripts.
 */
export const projectHygiene: PmCategory = {
  id: 'c-exp-builtin-0005',
  folderId: EXPLORER_FOLDER.id,
  name: 'Project Hygiene',
  icon: '',
  sortOrder: 4,
  createdAt: EXPLORER_NOW,
  updatedAt: EXPLORER_NOW,
  isBuiltIn: true,
}
