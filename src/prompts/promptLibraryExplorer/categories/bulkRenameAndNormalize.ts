import type { PmCategory } from '@/store/prompt-manager-store'

import { EXPLORER_FOLDER } from '../EXPLORER_FOLDER'
import { EXPLORER_NOW } from '../constants/explorerPromptDefaults'

/**
 * Category 3 — bulk filename normalization: kebab-case, snake_case,
 * stripping "Copy of …" / " (1)" suffixes, date prefixes, lowercase &
 * dash-replace-spaces. Every prompt requires confirmation before rename.
 */
export const bulkRenameAndNormalize: PmCategory = {
  id: 'c-exp-builtin-0003',
  folderId: EXPLORER_FOLDER.id,
  name: 'Bulk Rename & Normalize',
  icon: '',
  sortOrder: 2,
  createdAt: EXPLORER_NOW,
  updatedAt: EXPLORER_NOW,
  isBuiltIn: true,
}
