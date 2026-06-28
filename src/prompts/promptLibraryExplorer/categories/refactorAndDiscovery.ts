import type { PmCategory } from '@/store/prompt-manager-store'

import { EXPLORER_FOLDER } from '../EXPLORER_FOLDER'
import { EXPLORER_NOW } from '../constants/explorerPromptDefaults'

/**
 * Category 8 — refactor preparation & code discovery: symbol usage
 * lookups, import-graph queries, dead-file detection, largest-source-file
 * leaderboards, TODO/FIXME density per file.
 */
export const refactorAndDiscovery: PmCategory = {
  id: 'c-exp-builtin-0008',
  folderId: EXPLORER_FOLDER.id,
  name: 'Refactor & Code Discovery',
  icon: '',
  sortOrder: 7,
  createdAt: EXPLORER_NOW,
  updatedAt: EXPLORER_NOW,
  isBuiltIn: true,
}
