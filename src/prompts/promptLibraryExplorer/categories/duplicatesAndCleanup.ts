import type { PmCategory } from '@/store/prompt-manager-store'

import { EXPLORER_FOLDER } from '../EXPLORER_FOLDER'
import { EXPLORER_NOW } from '../constants/explorerPromptDefaults'

/**
 * Category 2 — find-and-clean prompts: duplicate filenames, "Copy of …"
 * artifacts, empty files/folders, OS junk, stale or oversized files.
 *
 * Every destructive variant always lists candidates first and emits the
 * `explorer-confirm` block — the user must confirm before deletion.
 */
export const duplicatesAndCleanup: PmCategory = {
  id: 'c-exp-builtin-0002',
  folderId: EXPLORER_FOLDER.id,
  name: 'Duplicates & Junk Cleanup',
  icon: '',
  sortOrder: 1,
  createdAt: EXPLORER_NOW,
  updatedAt: EXPLORER_NOW,
  isBuiltIn: true,
}
