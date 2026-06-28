import type { PmCategory } from '@/store/prompt-manager-store'

import { EXPLORER_FOLDER } from '../EXPLORER_FOLDER'
import { EXPLORER_NOW } from '../constants/explorerPromptDefaults'

/**
 * Category 6 — security & sensitive-file detection: hard-coded API key
 * scans, .env file inventory, world-writable permission audit, committed
 * credential pattern detection.
 *
 * Read-only by design — these prompts never delete or rewrite secrets;
 * they just surface them so the user can decide what to do.
 */
export const securityAndSecrets: PmCategory = {
  id: 'c-exp-builtin-0006',
  folderId: EXPLORER_FOLDER.id,
  name: 'Security & Secrets',
  icon: '',
  sortOrder: 5,
  createdAt: EXPLORER_NOW,
  updatedAt: EXPLORER_NOW,
  isBuiltIn: true,
}
