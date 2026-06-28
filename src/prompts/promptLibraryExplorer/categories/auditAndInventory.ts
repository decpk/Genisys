import type { PmCategory } from '@/store/prompt-manager-store'

import { EXPLORER_FOLDER } from '../EXPLORER_FOLDER'
import { EXPLORER_NOW } from '../constants/explorerPromptDefaults'

/**
 * Category 4 — read-only inventory reports: disk usage by subfolder, top-N
 * largest files, file-count-by-extension tables, folder-structure trees,
 * recently-modified summaries.
 *
 * No write ops anywhere in this category — purely informational.
 */
export const auditAndInventory: PmCategory = {
  id: 'c-exp-builtin-0004',
  folderId: EXPLORER_FOLDER.id,
  name: 'Audit & Inventory',
  icon: '',
  sortOrder: 3,
  createdAt: EXPLORER_NOW,
  updatedAt: EXPLORER_NOW,
  isBuiltIn: true,
}
